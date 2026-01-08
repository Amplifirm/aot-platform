import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { createBillingPortalSession } from "@/lib/services/stripe";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const url = await createBillingPortalSession(session.user.id);

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error("Portal error:", error);
    const message = error instanceof Error ? error.message : "Failed to create portal session";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
