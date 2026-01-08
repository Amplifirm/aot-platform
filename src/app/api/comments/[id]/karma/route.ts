import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { createCommentKarma, getUserCommentKarma } from "@/lib/services/comments";

const karmaSchema = z.object({
  value: z.enum(["1", "-1"]).transform((v) => parseInt(v) as 1 | -1),
});

// GET /api/comments/[id]/karma - Get user's karma vote on comment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const { id } = await params;
    const karma = await getUserCommentKarma(id, session.user.id);

    return NextResponse.json({
      success: true,
      data: karma,
    });
  } catch (error) {
    console.error("Error getting karma:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get karma" },
      { status: 500 }
    );
  }
}

// POST /api/comments/[id]/karma - Vote on a comment
export async function POST(
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
    const parsed = karmaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid karma value" },
        { status: 400 }
      );
    }

    const result = await createCommentKarma(id, session.user.id, parsed.data.value);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to vote";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
