import { db } from "@/lib/db/client";
import { groups, groupMemberships, users } from "@/lib/db/schema";
import { eq, and, desc, sql, like, or } from "drizzle-orm";

export interface CreateGroupInput {
  name: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
  createdById: string;
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  isPublic?: boolean;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 100);
}

// Create a new group
export async function createGroup(input: CreateGroupInput) {
  const { name, description, imageUrl, isPublic = true, createdById } = input;

  // Generate slug
  let slug = generateSlug(name);

  // Ensure unique slug
  const existing = await db.query.groups.findFirst({
    where: eq(groups.slug, slug),
  });

  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  // Create the group
  const [group] = await db
    .insert(groups)
    .values({
      slug,
      name,
      description: description || null,
      imageUrl: imageUrl || null,
      isPublic,
      createdById,
      memberCount: 1,
    })
    .returning();

  // Add creator as admin
  await db.insert(groupMemberships).values({
    groupId: group.id,
    userId: createdById,
    role: "admin",
  });

  return group;
}

// Get group by slug
export async function getGroupBySlug(slug: string) {
  const group = await db.query.groups.findFirst({
    where: eq(groups.slug, slug),
    with: {
      creator: {
        columns: {
          id: true,
          aotId: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      pinnedTarget: {
        columns: {
          id: true,
          slug: true,
          name: true,
          targetType: true,
          imageUrl: true,
        },
      },
    },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  // Get members count by role
  const members = await db.query.groupMemberships.findMany({
    where: eq(groupMemberships.groupId, group.id),
    with: {
      user: {
        columns: {
          id: true,
          aotId: true,
          displayName: true,
          avatarUrl: true,
          userType: true,
        },
      },
    },
    limit: 10,
    orderBy: [desc(groupMemberships.joinedAt)],
  });

  return {
    ...group,
    members: members.map((m) => ({
      ...m.user,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
  };
}

// List groups with filtering
export async function listGroups(options: {
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: "members" | "recent" | "karma";
}) {
  const { search, limit = 20, offset = 0, sortBy = "members" } = options;

  // Build where conditions
  const conditions = [eq(groups.isPublic, true)];

  if (search) {
    conditions.push(
      or(
        like(groups.name, `%${search}%`),
        like(groups.description, `%${search}%`)
      )!
    );
  }

  // Get total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(groups)
    .where(and(...conditions));

  const total = countResult?.count || 0;

  // Build order by
  let orderByClause;
  switch (sortBy) {
    case "karma":
      orderByClause = desc(groups.totalKarma);
      break;
    case "recent":
      orderByClause = desc(groups.createdAt);
      break;
    default:
      orderByClause = desc(groups.memberCount);
  }

  // Fetch groups
  const result = await db.query.groups.findMany({
    where: and(...conditions),
    orderBy: [orderByClause],
    limit,
    offset,
    with: {
      creator: {
        columns: {
          id: true,
          aotId: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  return { groups: result, total };
}

// Update a group
export async function updateGroup(
  groupId: string,
  userId: string,
  input: UpdateGroupInput
) {
  // Verify user is admin
  const membership = await db.query.groupMemberships.findFirst({
    where: and(
      eq(groupMemberships.groupId, groupId),
      eq(groupMemberships.userId, userId)
    ),
  });

  if (!membership || membership.role !== "admin") {
    throw new Error("Only admins can update group settings");
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (input.name !== undefined) {
    updateData.name = input.name;
  }
  if (input.description !== undefined) {
    updateData.description = input.description;
  }
  if (input.imageUrl !== undefined) {
    updateData.imageUrl = input.imageUrl;
  }
  if (input.isPublic !== undefined) {
    updateData.isPublic = input.isPublic;
  }

  const [updated] = await db
    .update(groups)
    .set(updateData)
    .where(eq(groups.id, groupId))
    .returning();

  return updated;
}

// Join a group
export async function joinGroup(groupId: string, userId: string) {
  // Check if already a member
  const existing = await db.query.groupMemberships.findFirst({
    where: and(
      eq(groupMemberships.groupId, groupId),
      eq(groupMemberships.userId, userId)
    ),
  });

  if (existing) {
    throw new Error("Already a member of this group");
  }

  // Check if group is public
  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
  });

  if (!group) {
    throw new Error("Group not found");
  }

  if (!group.isPublic) {
    throw new Error("This is a private group");
  }

  // Add membership
  await db.insert(groupMemberships).values({
    groupId,
    userId,
    role: "member",
  });

  // Update member count
  await db
    .update(groups)
    .set({
      memberCount: sql`${groups.memberCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(groups.id, groupId));

  return { success: true };
}

// Leave a group
export async function leaveGroup(groupId: string, userId: string) {
  const membership = await db.query.groupMemberships.findFirst({
    where: and(
      eq(groupMemberships.groupId, groupId),
      eq(groupMemberships.userId, userId)
    ),
  });

  if (!membership) {
    throw new Error("Not a member of this group");
  }

  // Check if user is the only admin
  if (membership.role === "admin") {
    const adminCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(groupMemberships)
      .where(
        and(
          eq(groupMemberships.groupId, groupId),
          eq(groupMemberships.role, "admin")
        )
      );

    if (adminCount[0]?.count === 1) {
      throw new Error("Cannot leave group as the only admin. Transfer ownership first.");
    }
  }

  // Remove membership
  await db
    .delete(groupMemberships)
    .where(
      and(
        eq(groupMemberships.groupId, groupId),
        eq(groupMemberships.userId, userId)
      )
    );

  // Update member count
  await db
    .update(groups)
    .set({
      memberCount: sql`GREATEST(${groups.memberCount} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(groups.id, groupId));

  return { success: true };
}

// Get user's membership in a group
export async function getUserMembership(groupId: string, userId: string) {
  return db.query.groupMemberships.findFirst({
    where: and(
      eq(groupMemberships.groupId, groupId),
      eq(groupMemberships.userId, userId)
    ),
  });
}

// Get group members
export async function getGroupMembers(
  groupId: string,
  limit = 50,
  offset = 0
) {
  const members = await db.query.groupMemberships.findMany({
    where: eq(groupMemberships.groupId, groupId),
    with: {
      user: {
        columns: {
          id: true,
          aotId: true,
          displayName: true,
          avatarUrl: true,
          userType: true,
          karma: true,
        },
      },
    },
    limit,
    offset,
    orderBy: [desc(groupMemberships.joinedAt)],
  });

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(groupMemberships)
    .where(eq(groupMemberships.groupId, groupId));

  return {
    members: members.map((m) => ({
      ...m.user,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
    total: countResult?.count || 0,
  };
}
