import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { joinGroup, leaveGroup, getGroupMembers } from "@/lib/services/groups";
import { db } from "@/lib/db/client";
import { groups } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/groups/[slug]/members - Get group members
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get group ID
    const group = await db.query.groups.findFirst({
      where: eq(groups.slug, slug),
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    const result = await getGroupMembers(group.id, Math.min(limit, 100), offset);

    return NextResponse.json({
      success: true,
      data: result.members,
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: offset + result.members.length < result.total,
      },
    });
  } catch (error) {
    console.error("Error getting members:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get members" },
      { status: 500 }
    );
  }
}

// POST /api/groups/[slug]/members - Join group
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    // Get group ID
    const group = await db.query.groups.findFirst({
      where: eq(groups.slug, slug),
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    await joinGroup(group.id, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Joined group successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to join group";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}

// DELETE /api/groups/[slug]/members - Leave group
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { slug } = await params;

    // Get group ID
    const group = await db.query.groups.findFirst({
      where: eq(groups.slug, slug),
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    await leaveGroup(group.id, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Left group successfully",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to leave group";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
