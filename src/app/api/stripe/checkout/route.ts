import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { createCheckoutSession } from "@/lib/services/stripe";
import type { SubscriptionTier } from "@/types";

const checkoutSchema = z.object({
  tier: z.enum(["T2", "T3", "T4", "T5"]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid tier" },
        { status: 400 }
      );
    }

    const { tier } = parsed.data;

    // Create checkout session
    const url = await createCheckoutSession(
      session.user.id,
      tier as SubscriptionTier,
      session.user.userType
    );

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    const message = error instanceof Error ? error.message : "Failed to create checkout";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
