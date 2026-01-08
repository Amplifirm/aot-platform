import { db } from "@/lib/db/client";
import { communications, users, karmaTransactions, votes } from "@/lib/db/schema";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { getTierCharLimit, getEffectiveTier } from "@/lib/utils/permissions";
import type { SubscriptionTier, UserType } from "@/types";

export interface CreateCommentInput {
  userId: string;
  content: string;
  voteId?: string;
  targetId?: string;
  parentId?: string;
  userType: UserType;
  subscriptionTier: SubscriptionTier;
}

export interface UpdateCommentInput {
  commentId: string;
  userId: string;
  content: string;
  userType: UserType;
  subscriptionTier: SubscriptionTier;
}

export interface CommentWithUser {
  id: string;
  content: string;
  characterCount: number;
  thumbsUp: number;
  thumbsDown: number;
  netKarma: number;
  voteId: string | null;
  targetId: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    aotId: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    userType: string;
    karma: number;
  };
  replies?: CommentWithUser[];
  replyCount?: number;
}

// Create a new comment
export async function createComment(input: CreateCommentInput): Promise<CommentWithUser> {
  const { userId, content, voteId, targetId, parentId, userType, subscriptionTier } = input;

  // Validate at least one target reference
  if (!voteId && !targetId) {
    throw new Error("Comment must be attached to a vote or target");
  }

  // Validate content
  if (!content.trim()) {
    throw new Error("Comment content cannot be empty");
  }

  const characterCount = content.length;

  // Check character limit based on tier
  const effectiveTier = getEffectiveTier(userType, subscriptionTier);
  const charLimit = getTierCharLimit(effectiveTier);

  if (charLimit !== null && characterCount > charLimit) {
    throw new Error(`Comment exceeds character limit of ${charLimit} for your tier`);
  }

  // If parentId provided, verify parent exists
  if (parentId) {
    const parent = await db.query.communications.findFirst({
      where: eq(communications.id, parentId),
    });
    if (!parent) {
      throw new Error("Parent comment not found");
    }
    // Ensure reply is to comment on same vote/target
    if (voteId && parent.voteId !== voteId) {
      throw new Error("Reply must be on same vote thread");
    }
    if (targetId && parent.targetId !== targetId) {
      throw new Error("Reply must be on same target thread");
    }
  }

  // Create the comment
  const [comment] = await db
    .insert(communications)
    .values({
      userId,
      content: content.trim(),
      characterCount,
      voteId: voteId || null,
      targetId: targetId || null,
      parentId: parentId || null,
    })
    .returning();

  // Update user's total comments count
  await db
    .update(users)
    .set({
      totalComments: sql`${users.totalComments} + 1`,
    })
    .where(eq(users.id, userId));

  // Fetch with user data
  return getCommentById(comment.id);
}

// Update an existing comment
export async function updateComment(input: UpdateCommentInput): Promise<CommentWithUser> {
  const { commentId, userId, content, userType, subscriptionTier } = input;

  // Validate content
  if (!content.trim()) {
    throw new Error("Comment content cannot be empty");
  }

  const characterCount = content.length;

  // Check character limit
  const effectiveTier = getEffectiveTier(userType, subscriptionTier);
  const charLimit = getTierCharLimit(effectiveTier);

  if (charLimit !== null && characterCount > charLimit) {
    throw new Error(`Comment exceeds character limit of ${charLimit} for your tier`);
  }

  // Verify ownership
  const existing = await db.query.communications.findFirst({
    where: eq(communications.id, commentId),
  });

  if (!existing) {
    throw new Error("Comment not found");
  }

  if (existing.userId !== userId) {
    throw new Error("You can only edit your own comments");
  }

  // Update comment
  await db
    .update(communications)
    .set({
      content: content.trim(),
      characterCount,
      updatedAt: new Date(),
    })
    .where(eq(communications.id, commentId));

  return getCommentById(commentId);
}

// Delete a comment
export async function deleteComment(commentId: string, userId: string, isAdmin = false): Promise<void> {
  const existing = await db.query.communications.findFirst({
    where: eq(communications.id, commentId),
  });

  if (!existing) {
    throw new Error("Comment not found");
  }

  if (!isAdmin && existing.userId !== userId) {
    throw new Error("You can only delete your own comments");
  }

  // Delete any karma transactions for this comment
  await db
    .delete(karmaTransactions)
    .where(eq(karmaTransactions.communicationId, commentId));

  // Delete the comment (cascade will handle replies due to parentId being null after delete)
  // But we need to handle replies manually since there's no cascade
  await deleteCommentAndReplies(commentId);

  // Update user's total comments count
  await db
    .update(users)
    .set({
      totalComments: sql`GREATEST(${users.totalComments} - 1, 0)`,
    })
    .where(eq(users.id, existing.userId));
}

// Recursively delete comment and its replies
async function deleteCommentAndReplies(commentId: string): Promise<void> {
  // Find all direct replies
  const replies = await db.query.communications.findMany({
    where: eq(communications.parentId, commentId),
  });

  // Recursively delete replies
  for (const reply of replies) {
    await deleteCommentAndReplies(reply.id);
  }

  // Delete karma transactions for this comment
  await db
    .delete(karmaTransactions)
    .where(eq(karmaTransactions.communicationId, commentId));

  // Delete the comment itself
  await db
    .delete(communications)
    .where(eq(communications.id, commentId));
}

// Get a single comment by ID with user info
export async function getCommentById(commentId: string): Promise<CommentWithUser> {
  const comment = await db.query.communications.findFirst({
    where: eq(communications.id, commentId),
    with: {
      user: {
        columns: {
          id: true,
          aotId: true,
          displayName: true,
          avatarUrl: true,
          userType: true,
          karma: true,
        },
      },
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Get reply count
  const [replyCountResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(communications)
    .where(eq(communications.parentId, commentId));

  return {
    id: comment.id,
    content: comment.content,
    characterCount: comment.characterCount,
    thumbsUp: comment.thumbsUp,
    thumbsDown: comment.thumbsDown,
    netKarma: comment.netKarma,
    voteId: comment.voteId,
    targetId: comment.targetId,
    parentId: comment.parentId,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    user: comment.user,
    replyCount: replyCountResult?.count || 0,
  };
}

// List comments for a vote or target with threading
export async function listComments(options: {
  voteId?: string;
  targetId?: string;
  parentId?: string | null;
  limit?: number;
  offset?: number;
  includeReplies?: boolean;
  maxDepth?: number;
}): Promise<{ comments: CommentWithUser[]; total: number }> {
  const { voteId, targetId, parentId = null, limit = 20, offset = 0, includeReplies = true, maxDepth = 3 } = options;

  if (!voteId && !targetId) {
    throw new Error("Must provide voteId or targetId");
  }

  // Build base conditions
  const conditions = [];
  if (voteId) {
    conditions.push(eq(communications.voteId, voteId));
  }
  if (targetId) {
    conditions.push(eq(communications.targetId, targetId));
  }

  // Only get top-level comments if parentId is null
  if (parentId === null) {
    conditions.push(isNull(communications.parentId));
  } else {
    conditions.push(eq(communications.parentId, parentId));
  }

  // Add moderation filter
  conditions.push(eq(communications.moderationStatus, "approved"));

  // Get total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(communications)
    .where(and(...conditions));

  const total = countResult?.count || 0;

  // Fetch comments
  const rawComments = await db.query.communications.findMany({
    where: and(...conditions),
    with: {
      user: {
        columns: {
          id: true,
          aotId: true,
          displayName: true,
          avatarUrl: true,
          userType: true,
          karma: true,
        },
      },
    },
    orderBy: [desc(communications.netKarma), desc(communications.createdAt)],
    limit,
    offset,
  });

  // Transform and optionally fetch replies
  const comments: CommentWithUser[] = await Promise.all(
    rawComments.map(async (comment) => {
      // Get reply count
      const [replyCountResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(communications)
        .where(eq(communications.parentId, comment.id));

      const transformed: CommentWithUser = {
        id: comment.id,
        content: comment.content,
        characterCount: comment.characterCount,
        thumbsUp: comment.thumbsUp,
        thumbsDown: comment.thumbsDown,
        netKarma: comment.netKarma,
        voteId: comment.voteId,
        targetId: comment.targetId,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: comment.user,
        replyCount: replyCountResult?.count || 0,
      };

      // Recursively fetch replies if requested
      if (includeReplies && maxDepth > 0 && transformed.replyCount! > 0) {
        const { comments: replies } = await listComments({
          voteId,
          targetId,
          parentId: comment.id,
          limit: 5, // Limit nested replies
          offset: 0,
          includeReplies: maxDepth > 1,
          maxDepth: maxDepth - 1,
        });
        transformed.replies = replies;
      }

      return transformed;
    })
  );

  return { comments, total };
}

// Create/toggle karma vote on a comment
export async function createCommentKarma(
  commentId: string,
  fromUserId: string,
  value: 1 | -1
): Promise<{ thumbsUp: number; thumbsDown: number; netKarma: number }> {
  const comment = await db.query.communications.findFirst({
    where: eq(communications.id, commentId),
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Prevent self-voting
  if (comment.userId === fromUserId) {
    throw new Error("Cannot vote on your own comment");
  }

  // Check for existing vote
  const existing = await db.query.karmaTransactions.findFirst({
    where: and(
      eq(karmaTransactions.fromUserId, fromUserId),
      eq(karmaTransactions.communicationId, commentId)
    ),
  });

  let thumbsUpDelta = 0;
  let thumbsDownDelta = 0;
  let authorKarmaDelta = 0;

  if (existing) {
    if (existing.value === value) {
      // Same vote - remove it (toggle off)
      await db
        .delete(karmaTransactions)
        .where(eq(karmaTransactions.id, existing.id));

      thumbsUpDelta = value === 1 ? -1 : 0;
      thumbsDownDelta = value === -1 ? -1 : 0;
      authorKarmaDelta = -value;
    } else {
      // Different vote - switch it
      await db
        .update(karmaTransactions)
        .set({ value })
        .where(eq(karmaTransactions.id, existing.id));

      thumbsUpDelta = value === 1 ? 1 : -1;
      thumbsDownDelta = value === -1 ? 1 : -1;
      authorKarmaDelta = value * 2; // Swing from -1 to +1 or vice versa
    }
  } else {
    // New vote
    await db.insert(karmaTransactions).values({
      fromUserId,
      toUserId: comment.userId,
      communicationId: commentId,
      value,
    });

    thumbsUpDelta = value === 1 ? 1 : 0;
    thumbsDownDelta = value === -1 ? 1 : 0;
    authorKarmaDelta = value;
  }

  // Update comment karma counts
  const [updated] = await db
    .update(communications)
    .set({
      thumbsUp: sql`${communications.thumbsUp} + ${thumbsUpDelta}`,
      thumbsDown: sql`${communications.thumbsDown} + ${thumbsDownDelta}`,
      netKarma: sql`${communications.netKarma} + ${authorKarmaDelta}`,
    })
    .where(eq(communications.id, commentId))
    .returning({
      thumbsUp: communications.thumbsUp,
      thumbsDown: communications.thumbsDown,
      netKarma: communications.netKarma,
    });

  // Update author's karma
  await db
    .update(users)
    .set({
      karma: sql`${users.karma} + ${authorKarmaDelta}`,
    })
    .where(eq(users.id, comment.userId));

  return updated;
}

// Get user's karma vote on a comment
export async function getUserCommentKarma(
  commentId: string,
  userId: string
): Promise<{ value: number } | null> {
  const karma = await db.query.karmaTransactions.findFirst({
    where: and(
      eq(karmaTransactions.fromUserId, userId),
      eq(karmaTransactions.communicationId, commentId)
    ),
    columns: {
      value: true,
    },
  });

  return karma || null;
}
