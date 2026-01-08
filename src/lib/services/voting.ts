import { db } from "@/lib/db/client";
import { votes, targets, users, votingHistory } from "@/lib/db/schema";
import { eq, and, desc, asc, sql, count } from "drizzle-orm";
import { getTierCharLimit, getEffectiveTier } from "@/lib/utils/permissions";
import type { SubscriptionTier, UserType } from "@/types";

export interface CreateVoteInput {
  userId: string;
  targetId: string;
  accomplishments: number;
  offenses: number;
  explanation?: string;
  userType: UserType;
  subscriptionTier: SubscriptionTier;
}

export interface UpdateVoteInput {
  accomplishments?: number;
  offenses?: number;
  explanation?: string;
}

export interface VoteFilters {
  targetId?: string;
  userId?: string;
  sortBy?: "recent" | "highest" | "lowest" | "karma";
  limit?: number;
  offset?: number;
}

/**
 * Validate score values (0-10 scale)
 */
export function validateScoreValue(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 10;
}

/**
 * Create a new vote
 */
export async function createVote(input: CreateVoteInput) {
  const { userId, targetId, accomplishments, offenses, explanation, userType, subscriptionTier } = input;

  // Validate scores
  if (!validateScoreValue(accomplishments) || !validateScoreValue(offenses)) {
    throw new Error("Scores must be integers between 0 and 10");
  }

  // Get effective tier (authenticated users get T2 for free)
  const effectiveTier = getEffectiveTier(userType, subscriptionTier);

  // Validate explanation length
  const charLimit = getTierCharLimit(effectiveTier);
  if (explanation && charLimit !== null && explanation.length > charLimit) {
    throw new Error(`Explanation exceeds character limit of ${charLimit}`);
  }

  // Check if user already voted on this target
  const existingVote = await db.query.votes.findFirst({
    where: and(eq(votes.userId, userId), eq(votes.targetId, targetId)),
  });

  if (existingVote) {
    throw new Error("You have already voted on this target. Use update to change your vote.");
  }

  // Calculate total
  const total = accomplishments - offenses;

  // Create the vote
  const [newVote] = await db
    .insert(votes)
    .values({
      userId,
      targetId,
      accomplishments,
      offenses,
      total,
      explanation: explanation || null,
      characterCount: explanation?.length || 0,
    })
    .returning();

  // Update user's vote count
  await db
    .update(users)
    .set({
      totalVotes: sql`${users.totalVotes} + 1`,
    })
    .where(eq(users.id, userId));

  // Recalculate target aggregate scores
  await recalculateTargetScores(targetId);

  return newVote;
}

/**
 * Update an existing vote
 */
export async function updateVote(
  voteId: string,
  userId: string,
  input: UpdateVoteInput,
  userType: UserType,
  subscriptionTier: SubscriptionTier
) {
  // Get the existing vote
  const existingVote = await db.query.votes.findFirst({
    where: eq(votes.id, voteId),
  });

  if (!existingVote) {
    throw new Error("Vote not found");
  }

  if (existingVote.userId !== userId) {
    throw new Error("You can only update your own votes");
  }

  // Validate new scores if provided
  if (input.accomplishments !== undefined && !validateScoreValue(input.accomplishments)) {
    throw new Error("Accomplishments must be an integer between 0 and 10");
  }
  if (input.offenses !== undefined && !validateScoreValue(input.offenses)) {
    throw new Error("Offenses must be an integer between 0 and 10");
  }

  // Get effective tier
  const effectiveTier = getEffectiveTier(userType, subscriptionTier);

  // Validate explanation length
  const charLimit = getTierCharLimit(effectiveTier);
  if (input.explanation && charLimit !== null && input.explanation.length > charLimit) {
    throw new Error(`Explanation exceeds character limit of ${charLimit}`);
  }

  // Calculate new values
  const newAccomplishments = input.accomplishments ?? existingVote.accomplishments;
  const newOffenses = input.offenses ?? existingVote.offenses;
  const newTotal = newAccomplishments - newOffenses;

  // Update the vote
  const [updatedVote] = await db
    .update(votes)
    .set({
      accomplishments: newAccomplishments,
      offenses: newOffenses,
      total: newTotal,
      explanation: input.explanation !== undefined ? input.explanation : existingVote.explanation,
      characterCount: input.explanation !== undefined ? input.explanation.length : existingVote.characterCount,
      updatedAt: new Date(),
    })
    .where(eq(votes.id, voteId))
    .returning();

  // Recalculate target aggregate scores
  await recalculateTargetScores(existingVote.targetId);

  return updatedVote;
}

/**
 * Get a single vote by ID
 */
export async function getVoteById(voteId: string) {
  const vote = await db.query.votes.findFirst({
    where: eq(votes.id, voteId),
    with: {
      user: {
        columns: {
          id: true,
          aotId: true,
          displayName: true,
          avatarUrl: true,
          userType: true,
        },
      },
      target: {
        columns: {
          id: true,
          slug: true,
          name: true,
          targetType: true,
        },
      },
    },
  });

  return vote;
}

/**
 * Get user's vote for a specific target
 */
export async function getUserVoteForTarget(userId: string, targetId: string) {
  const vote = await db.query.votes.findFirst({
    where: and(eq(votes.userId, userId), eq(votes.targetId, targetId)),
  });

  return vote;
}

/**
 * List votes with filtering and sorting
 */
export async function listVotes(filters: VoteFilters) {
  const { targetId, userId, sortBy = "recent", limit = 20, offset = 0 } = filters;

  // Build where conditions
  const conditions = [];
  if (targetId) conditions.push(eq(votes.targetId, targetId));
  if (userId) conditions.push(eq(votes.userId, userId));

  // Determine sort order
  let orderBy;
  switch (sortBy) {
    case "highest":
      orderBy = desc(votes.total);
      break;
    case "lowest":
      orderBy = asc(votes.total);
      break;
    case "karma":
      orderBy = desc(votes.netKarma);
      break;
    case "recent":
    default:
      orderBy = desc(votes.createdAt);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const results = await db.query.votes.findMany({
    where: whereClause,
    orderBy: [orderBy],
    limit,
    offset,
    with: {
      user: {
        columns: {
          id: true,
          aotId: true,
          displayName: true,
          avatarUrl: true,
          userType: true,
        },
      },
    },
  });

  // Get total count for pagination
  const [countResult] = await db
    .select({ count: count() })
    .from(votes)
    .where(whereClause);

  return {
    votes: results,
    total: countResult?.count || 0,
    limit,
    offset,
  };
}

/**
 * Recalculate aggregate scores for a target
 */
export async function recalculateTargetScores(targetId: string) {
  // Get all approved votes for this target
  const allVotes = await db.query.votes.findMany({
    where: and(
      eq(votes.targetId, targetId),
      eq(votes.moderationStatus, "approved")
    ),
    with: {
      user: {
        columns: {
          id: true,
          userType: true,
        },
      },
    },
  });

  if (allVotes.length === 0) {
    // Reset to defaults if no votes
    await db
      .update(targets)
      .set({
        avgAccomplishments: "0",
        avgOffenses: "0",
        avgTotal: "0",
        totalVotes: 0,
        anonymousVotes: 0,
        registeredVotes: 0,
        authenticatedVotes: 0,
        masterAccomplishments: null,
        masterOffenses: null,
        masterTotal: null,
        authAccomplishments: null,
        authOffenses: null,
        authTotal: null,
        updatedAt: new Date(),
      })
      .where(eq(targets.id, targetId));
    return;
  }

  // Calculate averages for all votes
  const totals = allVotes.reduce(
    (acc, v) => ({
      accomplishments: acc.accomplishments + v.accomplishments,
      offenses: acc.offenses + v.offenses,
      total: acc.total + v.total,
    }),
    { accomplishments: 0, offenses: 0, total: 0 }
  );

  const avgAccomplishments = totals.accomplishments / allVotes.length;
  const avgOffenses = totals.offenses / allVotes.length;
  const avgTotal = totals.total / allVotes.length;

  // Count votes by user type
  const anonymousVotes = allVotes.filter((v) => v.user.userType === "anonymous").length;
  const registeredVotes = allVotes.filter((v) => v.user.userType === "registered").length;
  const authenticatedVotes = allVotes.filter((v) => v.user.userType === "authenticated").length;

  // Calculate master score (registered + authenticated users only)
  const masterVotes = allVotes.filter(
    (v) => v.user.userType === "registered" || v.user.userType === "authenticated"
  );
  let masterAccomplishments = null;
  let masterOffenses = null;
  let masterTotal = null;

  if (masterVotes.length > 0) {
    const masterTotals = masterVotes.reduce(
      (acc, v) => ({
        accomplishments: acc.accomplishments + v.accomplishments,
        offenses: acc.offenses + v.offenses,
        total: acc.total + v.total,
      }),
      { accomplishments: 0, offenses: 0, total: 0 }
    );

    masterAccomplishments = (masterTotals.accomplishments / masterVotes.length).toFixed(2);
    masterOffenses = (masterTotals.offenses / masterVotes.length).toFixed(2);
    masterTotal = (masterTotals.total / masterVotes.length).toFixed(2);
  }

  // Calculate authenticated-only score
  const authVotes = allVotes.filter((v) => v.user.userType === "authenticated");
  let authAccomplishments = null;
  let authOffenses = null;
  let authTotal = null;

  if (authVotes.length > 0) {
    const authTotals = authVotes.reduce(
      (acc, v) => ({
        accomplishments: acc.accomplishments + v.accomplishments,
        offenses: acc.offenses + v.offenses,
        total: acc.total + v.total,
      }),
      { accomplishments: 0, offenses: 0, total: 0 }
    );

    authAccomplishments = (authTotals.accomplishments / authVotes.length).toFixed(2);
    authOffenses = (authTotals.offenses / authVotes.length).toFixed(2);
    authTotal = (authTotals.total / authVotes.length).toFixed(2);
  }

  // Update the target
  await db
    .update(targets)
    .set({
      avgAccomplishments: avgAccomplishments.toFixed(2),
      avgOffenses: avgOffenses.toFixed(2),
      avgTotal: avgTotal.toFixed(2),
      totalVotes: allVotes.length,
      anonymousVotes,
      registeredVotes,
      authenticatedVotes,
      masterAccomplishments,
      masterOffenses,
      masterTotal,
      authAccomplishments,
      authOffenses,
      authTotal,
      updatedAt: new Date(),
    })
    .where(eq(targets.id, targetId));

  // Create a voting history snapshot (daily)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingSnapshot = await db.query.votingHistory.findFirst({
    where: and(
      eq(votingHistory.targetId, targetId),
      eq(votingHistory.snapshotDate, today)
    ),
  });

  if (!existingSnapshot) {
    await db.insert(votingHistory).values({
      targetId,
      snapshotDate: today,
      avgAccomplishments: avgAccomplishments.toFixed(2),
      avgOffenses: avgOffenses.toFixed(2),
      avgTotal: avgTotal.toFixed(2),
      totalVotes: allVotes.length,
      masterTotal,
      authTotal,
    });
  } else {
    await db
      .update(votingHistory)
      .set({
        avgAccomplishments: avgAccomplishments.toFixed(2),
        avgOffenses: avgOffenses.toFixed(2),
        avgTotal: avgTotal.toFixed(2),
        totalVotes: allVotes.length,
        masterTotal,
        authTotal,
      })
      .where(eq(votingHistory.id, existingSnapshot.id));
  }
}

/**
 * Delete a vote (soft delete - move to dumpster)
 */
export async function deleteVote(voteId: string, userId: string, isAdmin = false) {
  const vote = await db.query.votes.findFirst({
    where: eq(votes.id, voteId),
  });

  if (!vote) {
    throw new Error("Vote not found");
  }

  if (!isAdmin && vote.userId !== userId) {
    throw new Error("You can only delete your own votes");
  }

  // Delete the vote
  await db.delete(votes).where(eq(votes.id, voteId));

  // Update user's vote count
  await db
    .update(users)
    .set({
      totalVotes: sql`GREATEST(${users.totalVotes} - 1, 0)`,
    })
    .where(eq(users.id, vote.userId));

  // Recalculate target scores
  await recalculateTargetScores(vote.targetId);

  return { success: true };
}
