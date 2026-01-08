import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { createGroup, listGroups } from "@/lib/services/groups";
import { getTierPermissions, getEffectiveTier } from "@/lib/utils/permissions";

const createGroupSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  isPublic: z.boolean().optional(),
});

// GET /api/groups - List groups
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = (searchParams.get("sortBy") || "members") as "members" | "recent" | "karma";

    const result = await listGroups({
      search,
      limit: Math.min(limit, 50),
      offset,
      sortBy,
    });

    return NextResponse.json({
      success: true,
      data: result.groups,
      pagination: {
        total: result.total,
        limit,
        offset,
        hasMore: offset + result.groups.length < result.total,
      },
    });
  } catch (error) {
    console.error("Error listing groups:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list groups" },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user can create groups
    const effectiveTier = getEffectiveTier(
      session.user.userType,
      session.user.subscriptionTier
    );
    const permissions = getTierPermissions(effectiveTier);

    if (!permissions.canCreateGroups) {
      return NextResponse.json(
        { success: false, error: "Upgrade to T2 or above to create groups" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createGroupSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const group = await createGroup({
      ...parsed.data,
      createdById: session.user.id,
    });

    return NextResponse.json({
      success: true,
      data: group,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    const message = error instanceof Error ? error.message : "Failed to create group";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
