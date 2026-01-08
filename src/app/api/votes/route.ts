import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { createVote, listVotes } from "@/lib/services/voting";
import { z } from "zod";

// Validation schema for creating a vote
const createVoteSchema = z.object({
  targetId: z.string().uuid("Invalid target ID"),
  accomplishments: z.number().int().min(0).max(10),
  offenses: z.number().int().min(0).max(10),
  explanation: z.string().optional(),
});

// GET /api/votes - List votes with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      targetId: searchParams.get("targetId") || undefined,
      userId: searchParams.get("userId") || undefined,
      sortBy: (searchParams.get("sortBy") as "recent" | "highest" | "lowest" | "karma") || "recent",
      limit: parseInt(searchParams.get("limit") || "20", 10),
      offset: parseInt(searchParams.get("offset") || "0", 10),
    };

    const result = await listVotes(filters);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error listing votes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list votes" },
      { status: 500 }
    );
  }
}

// POST /api/votes - Create a new vote
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to vote" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const parsed = createVoteSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const { targetId, accomplishments, offenses, explanation } = parsed.data;

    const vote = await createVote({
      userId: session.user.id,
      targetId,
      accomplishments,
      offenses,
      explanation,
      userType: session.user.userType,
      subscriptionTier: session.user.subscriptionTier,
    });

    return NextResponse.json({
      success: true,
      data: vote,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating vote:", error);
    const message = error instanceof Error ? error.message : "Failed to create vote";

    // Handle specific errors
    if (message.includes("already voted")) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 409 }
      );
    }

    if (message.includes("character limit")) {
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
