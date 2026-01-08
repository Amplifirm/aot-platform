import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users, votes, communications, groupMemberships, targets } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// GET /api/users/[id] - Get user profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const includeVotes = searchParams.get("includeVotes") === "true";
    const includeComments = searchParams.get("includeComments") === "true";
    const includeGroups = searchParams.get("includeGroups") === "true";

    // Find user by ID or aotId
    const user = await db.query.users.findFirst({
      where: id.startsWith("A-") || id.startsWith("R-") || id.startsWith("Auth-")
        ? eq(users.aotId, id)
        : eq(users.id, id),
      columns: {
        id: true,
        aotId: true,
        displayName: true,
        name: true,
        avatarUrl: true,
        image: true,
        bio: true,
        userType: true,
        subscriptionTier: true,
        karma: true,
        totalVotes: true,
        totalComments: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const result: Record<string, unknown> = { user };

    // Optionally include votes
    if (includeVotes) {
      const userVotes = await db
        .select({
          id: votes.id,
          accomplishments: votes.accomplishments,
          offenses: votes.offenses,
          total: votes.total,
          explanation: votes.explanation,
          thumbsUp: votes.thumbsUp,
          thumbsDown: votes.thumbsDown,
          netKarma: votes.netKarma,
          isPinned: votes.isPinned,
          createdAt: votes.createdAt,
          target: {
            id: targets.id,
            slug: targets.slug,
            name: targets.name,
            targetType: targets.targetType,
            imageUrl: targets.imageUrl,
          },
        })
        .from(votes)
        .leftJoin(targets, eq(votes.targetId, targets.id))
        .where(eq(votes.userId, user.id))
        .orderBy(desc(votes.createdAt))
        .limit(20);

      result.votes = userVotes;
    }

    // Optionally include comments
    if (includeComments) {
      const userComments = await db.query.communications.findMany({
        where: eq(communications.userId, user.id),
        orderBy: [desc(communications.createdAt)],
        limit: 20,
        columns: {
          id: true,
          content: true,
          thumbsUp: true,
          thumbsDown: true,
          netKarma: true,
          createdAt: true,
          voteId: true,
          targetId: true,
        },
      });

      result.comments = userComments;
    }

    // Optionally include groups
    if (includeGroups) {
      const userGroups = await db.query.groupMemberships.findMany({
        where: eq(groupMemberships.userId, user.id),
        with: {
          group: {
            columns: {
              id: true,
              slug: true,
              name: true,
              imageUrl: true,
              memberCount: true,
            },
          },
        },
      });

      result.groups = userGroups.map((m) => ({
        ...m.group,
        role: m.role,
        joinedAt: m.joinedAt,
      }));
    }

    // Get vote statistics
    const [statsResult] = await db
      .select({
        avgAccomplishments: sql<number>`avg(${votes.accomplishments})::numeric(4,2)`,
        avgOffenses: sql<number>`avg(${votes.offenses})::numeric(4,2)`,
        avgTotal: sql<number>`avg(${votes.total})::numeric(5,2)`,
        uniqueTargets: sql<number>`count(DISTINCT ${votes.targetId})::int`,
      })
      .from(votes)
      .where(eq(votes.userId, user.id));

    result.stats = statsResult;

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
