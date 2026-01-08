import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { targets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { listVotes, getUserVoteForTarget } from "@/lib/services/voting";

// GET /api/targets/[slug]/votes - Get votes for a specific target
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    // Find the target by slug
    const target = await db.query.targets.findFirst({
      where: eq(targets.slug, slug),
    });

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Target not found" },
        { status: 404 }
      );
    }

    // Get current user's vote if logged in
    const session = await auth();
    let userVote = null;
    if (session?.user) {
      userVote = await getUserVoteForTarget(session.user.id, target.id);
    }

    // Get paginated votes for the target
    const filters = {
      targetId: target.id,
      sortBy: (searchParams.get("sortBy") as "recent" | "highest" | "lowest" | "karma") || "recent",
      limit: parseInt(searchParams.get("limit") || "20", 10),
      offset: parseInt(searchParams.get("offset") || "0", 10),
    };

    const result = await listVotes(filters);

    return NextResponse.json({
      success: true,
      data: {
        target: {
          id: target.id,
          slug: target.slug,
          name: target.name,
          targetType: target.targetType,
          avgAccomplishments: target.avgAccomplishments,
          avgOffenses: target.avgOffenses,
          avgTotal: target.avgTotal,
          masterTotal: target.masterTotal,
          authTotal: target.authTotal,
          totalVotes: target.totalVotes,
          registeredVotes: target.registeredVotes,
          authenticatedVotes: target.authenticatedVotes,
        },
        userVote,
        votes: result.votes,
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      },
    });
  } catch (error) {
    console.error("Error fetching target votes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch votes" },
      { status: 500 }
    );
  }
}
