import Stripe from "stripe";
import { db } from "@/lib/db/client";
import { users, subscriptionPlans } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { SubscriptionTier, UserType } from "@/types";

// Lazy initialize Stripe to avoid build-time errors
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return _stripe;
}

// Export for convenience (lazy accessor)
export const stripe = {
  get customers() { return getStripe().customers; },
  get checkout() { return getStripe().checkout; },
  get subscriptions() { return getStripe().subscriptions; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
};

// Get or create Stripe customer
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      displayName: true,
      name: true,
      stripeCustomerId: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email || undefined,
    name: user.displayName || user.name || undefined,
    metadata: {
      userId: user.id,
    },
  });

  // Save customer ID to user
  await db
    .update(users)
    .set({ stripeCustomerId: customer.id })
    .where(eq(users.id, userId));

  return customer.id;
}

// Create checkout session for subscription
export async function createCheckoutSession(
  userId: string,
  tier: SubscriptionTier,
  userType: UserType
): Promise<string> {
  // Get Stripe customer
  const customerId = await getOrCreateStripeCustomer(userId);

  // Get the plan for this tier and user type
  const plan = await db.query.subscriptionPlans.findFirst({
    where: eq(subscriptionPlans.tier, tier),
  });

  if (!plan) {
    throw new Error(`No subscription plan found for tier ${tier}`);
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    metadata: {
      userId,
      tier,
      userType,
    },
    subscription_data: {
      metadata: {
        userId,
        tier,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return session.url;
}

// Create billing portal session
export async function createBillingPortalSession(userId: string): Promise<string> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      stripeCustomerId: true,
    },
  });

  if (!user?.stripeCustomerId) {
    throw new Error("No Stripe customer found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  });

  return session.url;
}

// Handle checkout.session.completed webhook
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const tier = session.metadata?.tier as SubscriptionTier;

  if (!userId || !tier) {
    console.error("Missing metadata in checkout session");
    return;
  }

  // Get subscription details
  const subscriptionId = session.subscription as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
  const periodEnd = subscription.current_period_end || subscription.currentPeriodEnd;

  // Update user's subscription
  await db
    .update(users)
    .set({
      subscriptionTier: tier,
      stripeSubscriptionId: subscriptionId,
      subscriptionEndsAt: periodEnd ? new Date(periodEnd * 1000) : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  console.log(`User ${userId} upgraded to ${tier}`);
}

// Handle customer.subscription.updated webhook
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleSubscriptionUpdated(subscription: any) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("Missing userId in subscription metadata");
    return;
  }

  const tier = subscription.metadata?.tier as SubscriptionTier;
  const periodEnd = subscription.current_period_end || subscription.currentPeriodEnd;

  // Update user's subscription status
  await db
    .update(users)
    .set({
      subscriptionTier: tier || "T1",
      subscriptionEndsAt: periodEnd ? new Date(periodEnd * 1000) : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  console.log(`Subscription updated for user ${userId}`);
}

// Handle customer.subscription.deleted webhook
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleSubscriptionDeleted(subscription: any) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    // Try to find user by Stripe customer ID
    const customerId = subscription.customer as string;
    const user = await db.query.users.findFirst({
      where: eq(users.stripeCustomerId, customerId),
    });

    if (user) {
      await db
        .update(users)
        .set({
          subscriptionTier: "T1",
          stripeSubscriptionId: null,
          subscriptionEndsAt: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      console.log(`Subscription cancelled for user ${user.id}`);
    }
    return;
  }

  // Downgrade user to T1
  await db
    .update(users)
    .set({
      subscriptionTier: "T1",
      stripeSubscriptionId: null,
      subscriptionEndsAt: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  console.log(`Subscription deleted for user ${userId}`);
}

// Handle invoice.payment_failed webhook
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handlePaymentFailed(invoice: any) {
  const customerId = invoice.customer as string;

  const user = await db.query.users.findFirst({
    where: eq(users.stripeCustomerId, customerId),
  });

  if (user) {
    // Could send email notification here
    console.log(`Payment failed for user ${user.id}`);
  }
}
