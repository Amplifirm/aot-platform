import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getVoteById } from "@/lib/services/voting";
import { createKarmaVote, getUserKarmaVote } from "@/lib/services/karma";
import { z } from "zod";

const karmaSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});

// GET /api/votes/[id]/karma - Get user's karma vote for this vote
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({
        success: true,
        data: { userVote: null },
      });
    }

    const { id } = await params;

    const karmaVote = await getUserKarmaVote(session.user.id, id);

    return NextResponse.json({
      success: true,
      data: {
        userVote: karmaVote?.value || null,
      },
    });
  } catch (error) {
    console.error("Error fetching karma vote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch karma vote" },
      { status: 500 }
    );
  }
}

// POST /api/votes/[id]/karma - Vote thumbs up/down on a vote
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to vote" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const parsed = karmaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Value must be 1 (thumbs up) or -1 (thumbs down)" },
        { status: 400 }
      );
    }

    // Get the vote to find the author
    const vote = await getVoteById(id);
    if (!vote) {
      return NextResponse.json(
        { success: false, error: "Vote not found" },
        { status: 404 }
      );
    }

    const result = await createKarmaVote({
      fromUserId: session.user.id,
      toUserId: vote.userId,
      value: parsed.data.value,
      voteId: id,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error creating karma vote:", error);
    const message = error instanceof Error ? error.message : "Failed to vote";

    if (message.includes("cannot vote on your own")) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
