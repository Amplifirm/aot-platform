import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { createComment, listComments } from "@/lib/services/comments";

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(50000),
  voteId: z.string().uuid().optional(),
  targetId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
}).refine((data) => data.voteId || data.targetId, {
  message: "Must provide either voteId or targetId",
});

// GET /api/comments - List comments
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const voteId = searchParams.get("voteId") || undefined;
    const targetId = searchParams.get("targetId") || undefined;
    const parentId = searchParams.get("parentId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const includeReplies = searchParams.get("includeReplies") !== "false";
    const maxDepth = parseInt(searchParams.get("maxDepth") || "3");

    if (!voteId && !targetId) {
      return NextResponse.json(
        { success: false, error: "Must provide voteId or targetId" },
        { status: 400 }
      );
    }

    const result = await listComments({
      voteId,
      targetId,
      parentId: parentId === "null" ? null : parentId || null,
      limit: Math.min(limit, 50),
      offset,
      includeReplies,
      maxDepth: Math.min(maxDepth, 5),
    });

    return NextResponse.json({
      success: true,
      data: result.comments,
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: offset + result.comments.length < result.total,
      },
    });
  } catch (error) {
    console.error("Error listing comments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list comments" },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const { content, voteId, targetId, parentId } = parsed.data;

    const comment = await createComment({
      userId: session.user.id,
      content,
      voteId,
      targetId,
      parentId,
      userType: session.user.userType,
      subscriptionTier: session.user.subscriptionTier,
    });

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    const message = error instanceof Error ? error.message : "Failed to create comment";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
