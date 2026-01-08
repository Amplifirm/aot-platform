import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db/client";
import { suggestions } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetType, name, description, wikipediaUrl, category } = body;

    // Validate required fields
    if (!targetType || !["person", "country", "idea"].includes(targetType)) {
      return NextResponse.json(
        { success: false, error: "Invalid target type" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Name is required" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Description is required" },
        { status: 400 }
      );
    }

    // Validate Wikipedia URL if provided
    if (wikipediaUrl && typeof wikipediaUrl === "string") {
      try {
        const url = new URL(wikipediaUrl);
        if (!url.hostname.includes("wikipedia.org")) {
          return NextResponse.json(
            { success: false, error: "URL must be a Wikipedia link" },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid URL format" },
          { status: 400 }
        );
      }
    }

    // Create the suggestion
    const [suggestion] = await db
      .insert(suggestions)
      .values({
        suggestedById: session.user.id,
        targetType: targetType as "person" | "country" | "idea",
        name: name.trim(),
        description: description.trim(),
        wikipediaUrl: wikipediaUrl?.trim() || null,
        category: category || null,
        status: "pending",
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: suggestion.id,
        name: suggestion.name,
        status: suggestion.status,
      },
    });
  } catch (error) {
    console.error("Error creating suggestion:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create suggestion" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Only admins can view all suggestions
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const allSuggestions = await db.query.suggestions.findMany({
      where: (s, { eq }) => eq(s.status, status as any),
      orderBy: (s, { desc }) => [desc(s.createdAt)],
      with: {
        suggestedBy: {
          columns: {
            id: true,
            displayName: true,
            aotId: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: allSuggestions,
    });
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
