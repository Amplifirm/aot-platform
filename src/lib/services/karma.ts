import { db } from "@/lib/db/client";
import { karmaTransactions, votes, communications, users } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export type KarmaValue = 1 | -1;

export interface KarmaVoteInput {
  fromUserId: string;
  toUserId: string;
  value: KarmaValue;
  voteId?: string;
  communicationId?: string;
}

/**
 * Vote on a vote or comment (thumbs up/down)
 */
export async function createKarmaVote(input: KarmaVoteInput) {
  const { fromUserId, toUserId, value, voteId, communicationId } = input;

  // Prevent self-voting
  if (fromUserId === toUserId) {
    throw new Error("You cannot vote on your own content");
  }

  // Must provide either voteId or communicationId
  if (!voteId && !communicationId) {
    throw new Error("Must provide either voteId or communicationId");
  }

  // Check for existing karma transaction
  let existingKarma;
  if (voteId) {
    existingKarma = await db.query.karmaTransactions.findFirst({
      where: and(
        eq(karmaTransactions.fromUserId, fromUserId),
        eq(karmaTransactions.voteId, voteId)
      ),
    });
  } else if (communicationId) {
    existingKarma = await db.query.karmaTransactions.findFirst({
      where: and(
        eq(karmaTransactions.fromUserId, fromUserId),
        eq(karmaTransactions.communicationId, communicationId)
      ),
    });
  }

  // If same vote exists, remove it (toggle off)
  if (existingKarma && existingKarma.value === value) {
    await db.delete(karmaTransactions).where(eq(karmaTransactions.id, existingKarma.id));

    // Update the item's karma counts
    if (voteId) {
      if (value === 1) {
        await db.update(votes).set({
          thumbsUp: sql`GREATEST(${votes.thumbsUp} - 1, 0)`,
          netKarma: sql`${votes.netKarma} - 1`,
        }).where(eq(votes.id, voteId));
      } else {
        await db.update(votes).set({
          thumbsDown: sql`GREATEST(${votes.thumbsDown} - 1, 0)`,
          netKarma: sql`${votes.netKarma} + 1`,
        }).where(eq(votes.id, voteId));
      }
    } else if (communicationId) {
      if (value === 1) {
        await db.update(communications).set({
          thumbsUp: sql`GREATEST(${communications.thumbsUp} - 1, 0)`,
          netKarma: sql`${communications.netKarma} - 1`,
        }).where(eq(communications.id, communicationId));
      } else {
        await db.update(communications).set({
          thumbsDown: sql`GREATEST(${communications.thumbsDown} - 1, 0)`,
          netKarma: sql`${communications.netKarma} + 1`,
        }).where(eq(communications.id, communicationId));
      }
    }

    // Update user's karma
    await db.update(users).set({
      karma: sql`${users.karma} - ${value}`,
    }).where(eq(users.id, toUserId));

    return { action: "removed", value: 0 };
  }

  // If opposite vote exists, update it
  if (existingKarma) {
    const oldValue = existingKarma.value;

    await db.update(karmaTransactions).set({
      value,
      createdAt: new Date(),
    }).where(eq(karmaTransactions.id, existingKarma.id));

    // Update the item's karma counts
    if (voteId) {
      if (value === 1) {
        await db.update(votes).set({
          thumbsUp: sql`${votes.thumbsUp} + 1`,
          thumbsDown: sql`GREATEST(${votes.thumbsDown} - 1, 0)`,
          netKarma: sql`${votes.netKarma} + 2`,
        }).where(eq(votes.id, voteId));
      } else {
        await db.update(votes).set({
          thumbsUp: sql`GREATEST(${votes.thumbsUp} - 1, 0)`,
          thumbsDown: sql`${votes.thumbsDown} + 1`,
          netKarma: sql`${votes.netKarma} - 2`,
        }).where(eq(votes.id, voteId));
      }
    } else if (communicationId) {
      if (value === 1) {
        await db.update(communications).set({
          thumbsUp: sql`${communications.thumbsUp} + 1`,
          thumbsDown: sql`GREATEST(${communications.thumbsDown} - 1, 0)`,
          netKarma: sql`${communications.netKarma} + 2`,
        }).where(eq(communications.id, communicationId));
      } else {
        await db.update(communications).set({
          thumbsUp: sql`GREATEST(${communications.thumbsUp} - 1, 0)`,
          thumbsDown: sql`${communications.thumbsDown} + 1`,
          netKarma: sql`${communications.netKarma} - 2`,
        }).where(eq(communications.id, communicationId));
      }
    }

    // Update user's karma (difference between new and old value)
    await db.update(users).set({
      karma: sql`${users.karma} + ${value - oldValue}`,
    }).where(eq(users.id, toUserId));

    return { action: "updated", value };
  }

  // Create new karma transaction
  await db.insert(karmaTransactions).values({
    fromUserId,
    toUserId,
    value,
    voteId: voteId || null,
    communicationId: communicationId || null,
  });

  // Update the item's karma counts
  if (voteId) {
    if (value === 1) {
      await db.update(votes).set({
        thumbsUp: sql`${votes.thumbsUp} + 1`,
        netKarma: sql`${votes.netKarma} + 1`,
      }).where(eq(votes.id, voteId));
    } else {
      await db.update(votes).set({
        thumbsDown: sql`${votes.thumbsDown} + 1`,
        netKarma: sql`${votes.netKarma} - 1`,
      }).where(eq(votes.id, voteId));
    }
  } else if (communicationId) {
    if (value === 1) {
      await db.update(communications).set({
        thumbsUp: sql`${communications.thumbsUp} + 1`,
        netKarma: sql`${communications.netKarma} + 1`,
      }).where(eq(communications.id, communicationId));
    } else {
      await db.update(communications).set({
        thumbsDown: sql`${communications.thumbsDown} + 1`,
        netKarma: sql`${communications.netKarma} - 1`,
      }).where(eq(communications.id, communicationId));
    }
  }

  // Update user's karma
  await db.update(users).set({
    karma: sql`${users.karma} + ${value}`,
  }).where(eq(users.id, toUserId));

  return { action: "created", value };
}

/**
 * Get user's karma vote for a specific item
 */
export async function getUserKarmaVote(
  userId: string,
  voteId?: string,
  communicationId?: string
) {
  if (voteId) {
    return db.query.karmaTransactions.findFirst({
      where: and(
        eq(karmaTransactions.fromUserId, userId),
        eq(karmaTransactions.voteId, voteId)
      ),
    });
  }

  if (communicationId) {
    return db.query.karmaTransactions.findFirst({
      where: and(
        eq(karmaTransactions.fromUserId, userId),
        eq(karmaTransactions.communicationId, communicationId)
      ),
    });
  }

  return null;
}
