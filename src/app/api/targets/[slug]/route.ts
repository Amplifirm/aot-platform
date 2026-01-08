import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { targets, votingHistory, eventLabels } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/targets/[slug] - Get a single target by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get the target
    const [target] = await db
      .select()
      .from(targets)
      .where(eq(targets.slug, slug))
      .limit(1);

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Target not found" },
        { status: 404 }
      );
    }

    // Get voting history for charts (last 30 days)
    const history = await db
      .select({
        date: votingHistory.snapshotDate,
        avgAccomplishments: votingHistory.avgAccomplishments,
        avgOffenses: votingHistory.avgOffenses,
        avgTotal: votingHistory.avgTotal,
        totalVotes: votingHistory.totalVotes,
        masterTotal: votingHistory.masterTotal,
        authTotal: votingHistory.authTotal,
      })
      .from(votingHistory)
      .where(eq(votingHistory.targetId, target.id))
      .orderBy(desc(votingHistory.snapshotDate))
      .limit(30);

    // Get event labels for this target
    const events = await db
      .select({
        id: eventLabels.id,
        date: eventLabels.eventDate,
        label: eventLabels.label,
        description: eventLabels.description,
        sourceUrl: eventLabels.sourceUrl,
      })
      .from(eventLabels)
      .where(eq(eventLabels.targetId, target.id))
      .orderBy(desc(eventLabels.eventDate));

    return NextResponse.json({
      success: true,
      data: {
        target: {
          id: target.id,
          slug: target.slug,
          name: target.name,
          targetType: target.targetType,
          shortDescription: target.shortDescription,
          longDescription: target.longDescription,
          wikipediaUrl: target.wikipediaUrl,
          imageUrl: target.imageUrl,
          metadata: target.metadata,
          avgAccomplishments: target.avgAccomplishments,
          avgOffenses: target.avgOffenses,
          avgTotal: target.avgTotal,
          masterAccomplishments: target.masterAccomplishments,
          masterOffenses: target.masterOffenses,
          masterTotal: target.masterTotal,
          authAccomplishments: target.authAccomplishments,
          authOffenses: target.authOffenses,
          authTotal: target.authTotal,
          totalVotes: target.totalVotes,
          anonymousVotes: target.anonymousVotes,
          registeredVotes: target.registeredVotes,
          authenticatedVotes: target.authenticatedVotes,
          isPinned: target.isPinned,
          createdAt: target.createdAt,
          updatedAt: target.updatedAt,
        },
        variants: [], // TODO: fetch from targetVariants table if needed
        history: history.reverse(), // Oldest first for charts
        events,
      },
    });
  } catch (error) {
    console.error("Error fetching target:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch target" },
      { status: 500 }
    );
  }
}
