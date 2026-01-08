import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { getGroupBySlug, updateGroup, getUserMembership } from "@/lib/services/groups";
import { db } from "@/lib/db/client";
import { groups } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const updateGroupSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  isPublic: z.boolean().optional(),
});

// GET /api/groups/[slug] - Get group details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();

    const group = await getGroupBySlug(slug);

    // Get user's membership if logged in
    let membership = null;
    if (session?.user?.id) {
      membership = await getUserMembership(group.id, session.user.id);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...group,
        userMembership: membership
          ? { role: membership.role, joinedAt: membership.joinedAt }
          : null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Group not found";
    return NextResponse.json(
      { success: false, error: message },
      { status: 404 }
    );
  }
}

// PUT /api/groups/[slug] - Update group
export async function PUT(
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
    const body = await req.json();
    const parsed = updateGroupSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    // Get group ID from slug
    const group = await db.query.groups.findFirst({
      where: eq(groups.slug, slug),
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    const updated = await updateGroup(group.id, session.user.id, parsed.data);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update group";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
