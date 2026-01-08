import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getVoteById, updateVote, deleteVote } from "@/lib/services/voting";
import { z } from "zod";

// Validation schema for updating a vote
const updateVoteSchema = z.object({
  accomplishments: z.number().int().min(0).max(10).optional(),
  offenses: z.number().int().min(0).max(10).optional(),
  explanation: z.string().optional(),
});

// GET /api/votes/[id] - Get a single vote
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const vote = await getVoteById(id);

    if (!vote) {
      return NextResponse.json(
        { success: false, error: "Vote not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vote,
    });
  } catch (error) {
    console.error("Error fetching vote:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch vote" },
      { status: 500 }
    );
  }
}

// PUT /api/votes/[id] - Update a vote
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to update a vote" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const parsed = updateVoteSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const updatedVote = await updateVote(
      id,
      session.user.id,
      parsed.data,
      session.user.userType,
      session.user.subscriptionTier
    );

    return NextResponse.json({
      success: true,
      data: updatedVote,
    });
  } catch (error) {
    console.error("Error updating vote:", error);
    const message = error instanceof Error ? error.message : "Failed to update vote";

    if (message.includes("not found")) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 404 }
      );
    }

    if (message.includes("only update your own")) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 403 }
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

// DELETE /api/votes/[id] - Delete a vote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to delete a vote" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const isAdmin = session.user.role === "admin" || session.user.role === "moderator";

    await deleteVote(id, session.user.id, isAdmin);

    return NextResponse.json({
      success: true,
      message: "Vote deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vote:", error);
    const message = error instanceof Error ? error.message : "Failed to delete vote";

    if (message.includes("not found")) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 404 }
      );
    }

    if (message.includes("only delete your own")) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
