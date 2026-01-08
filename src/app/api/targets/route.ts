import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { targets } from "@/lib/db/schema";
import { eq, desc, asc, and, ilike, sql, count } from "drizzle-orm";
import type { TargetType } from "@/types";

// GET /api/targets - List targets with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query params
    const type = searchParams.get("type") as TargetType | null;
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "recent";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const pinned = searchParams.get("pinned") === "true";

    // Build where conditions
    const conditions = [eq(targets.isActive, true)];

    if (type && ["person", "country", "idea"].includes(type)) {
      conditions.push(eq(targets.targetType, type));
    }

    if (search) {
      conditions.push(ilike(targets.name, `%${search}%`));
    }

    if (pinned) {
      conditions.push(eq(targets.isPinned, true));
    }

    // Determine sort order
    let orderBy;
    switch (sortBy) {
      case "highest":
        orderBy = desc(targets.masterTotal);
        break;
      case "lowest":
        orderBy = asc(targets.masterTotal);
        break;
      case "most-voted":
        orderBy = desc(targets.totalVotes);
        break;
      case "name":
        orderBy = asc(targets.name);
        break;
      case "recent":
      default:
        orderBy = desc(targets.createdAt);
    }

    const whereClause = and(...conditions);

    // Get targets
    const results = await db
      .select({
        id: targets.id,
        slug: targets.slug,
        name: targets.name,
        targetType: targets.targetType,
        shortDescription: targets.shortDescription,
        imageUrl: targets.imageUrl,
        wikipediaUrl: targets.wikipediaUrl,
        avgAccomplishments: targets.avgAccomplishments,
        avgOffenses: targets.avgOffenses,
        avgTotal: targets.avgTotal,
        masterTotal: targets.masterTotal,
        authTotal: targets.authTotal,
        totalVotes: targets.totalVotes,
        registeredVotes: targets.registeredVotes,
        authenticatedVotes: targets.authenticatedVotes,
        isPinned: targets.isPinned,
        createdAt: targets.createdAt,
      })
      .from(targets)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: count() })
      .from(targets)
      .where(whereClause);

    return NextResponse.json({
      success: true,
      data: {
        targets: results,
        total: countResult?.count || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("Error listing targets:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list targets" },
      { status: 500 }
    );
  }
}
