import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { getCommentById, updateComment, deleteComment } from "@/lib/services/comments";

const updateCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(50000),
});

// GET /api/comments/[id] - Get a single comment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comment = await getCommentById(id);

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Comment not found";
    return NextResponse.json(
      { success: false, error: message },
      { status: 404 }
    );
  }
}

// PUT /api/comments/[id] - Update a comment
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateCommentSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const comment = await updateComment({
      commentId: id,
      userId: session.user.id,
      content: parsed.data.content,
      userType: session.user.userType,
      subscriptionTier: session.user.subscriptionTier,
    });

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update comment";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const isAdmin = session.user.role === "admin" || session.user.role === "moderator";

    await deleteComment(id, session.user.id, isAdmin);

    return NextResponse.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete comment";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
