/**
 * Seed script to create Stripe products and prices, then populate the subscriptionPlans table
 *
 * Run with: npx tsx src/scripts/seed-stripe-plans.ts
 */

import Stripe from "stripe";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { subscriptionPlans } from "../lib/db/schema";
import { eq, and } from "drizzle-orm";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

const connection = postgres(process.env.DATABASE_URL!);
const db = drizzle(connection);

// Plan configurations
const PLANS = [
  {
    tier: "T2" as const,
    name: "AOT Basic",
    description: "Unlimited responses and group creation",
    priceMonthly: 100, // $1.00
    features: ["Unlimited responses", "Create groups", "140 char explanations"],
  },
  {
    tier: "T3" as const,
    name: "AOT Pro",
    description: "Enhanced features for power users",
    priceMonthly: 500, // $5.00
    features: ["Everything in Basic", "500 char explanations", "Add hyperlinks"],
  },
  {
    tier: "T4" as const,
    name: "AOT Premium",
    description: "Extended explanations for detailed analysis",
    priceMonthly: 1000, // $10.00
    features: ["Everything in Pro", "50,000 char explanations"],
  },
  {
    tier: "T5" as const,
    name: "AOT Ultimate",
    description: "Everything unlimited",
    priceMonthly: 5000, // $50.00
    features: ["Everything in Premium", "Unlimited explanations", "Upload documents"],
  },
];

async function seedStripePlans() {
  console.log("Starting Stripe plans seed...\n");

  for (const plan of PLANS) {
    console.log(`Processing ${plan.name} (${plan.tier})...`);

    try {
      // Check if product already exists by searching
      const existingProducts = await stripe.products.search({
        query: `metadata['tier']:'${plan.tier}'`,
      });

      let product: Stripe.Product;
      let price: Stripe.Price;

      if (existingProducts.data.length > 0) {
        product = existingProducts.data[0];
        console.log(`  Found existing product: ${product.id}`);

        // Get the active price
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
          type: "recurring",
        });

        if (prices.data.length > 0) {
          price = prices.data[0];
          console.log(`  Found existing price: ${price.id}`);
        } else {
          // Create new price if none exists
          price = await stripe.prices.create({
            product: product.id,
            unit_amount: plan.priceMonthly,
            currency: "usd",
            recurring: { interval: "month" },
          });
          console.log(`  Created new price: ${price.id}`);
        }
      } else {
        // Create new product
        product = await stripe.products.create({
          name: plan.name,
          description: plan.description,
          metadata: {
            tier: plan.tier,
          },
        });
        console.log(`  Created product: ${product.id}`);

        // Create price
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.priceMonthly,
          currency: "usd",
          recurring: { interval: "month" },
        });
        console.log(`  Created price: ${price.id}`);
      }

      // Check if plan exists in database for registered users
      const existingPlan = await db
        .select()
        .from(subscriptionPlans)
        .where(
          and(
            eq(subscriptionPlans.tier, plan.tier),
            eq(subscriptionPlans.userType, "registered")
          )
        );

      if (existingPlan.length > 0) {
        // Update existing plan
        await db
          .update(subscriptionPlans)
          .set({
            stripePriceId: price.id,
            stripeProductId: product.id,
            priceMonthly: plan.priceMonthly,
            features: plan.features,
            isActive: true,
          })
          .where(
            and(
              eq(subscriptionPlans.tier, plan.tier),
              eq(subscriptionPlans.userType, "registered")
            )
          );
        console.log(`  Updated database plan for registered users`);
      } else {
        // Insert new plan for registered users
        await db.insert(subscriptionPlans).values({
          tier: plan.tier,
          userType: "registered",
          stripePriceId: price.id,
          stripeProductId: product.id,
          priceMonthly: plan.priceMonthly,
          features: plan.features,
          isActive: true,
        });
        console.log(`  Inserted database plan for registered users`);
      }

      // Also handle authenticated users (they get different pricing)
      const authenticatedPricing: Record<string, number> = {
        T2: 0, // Free for authenticated
        T3: 100, // $1
        T4: 500, // $5
        T5: 1000, // $10
      };

      const authPrice = authenticatedPricing[plan.tier];

      // For authenticated users, T2 is free so we don't need a Stripe price
      if (authPrice > 0) {
        // Check for existing authenticated price in Stripe
        const existingAuthProducts = await stripe.products.search({
          query: `metadata['tier']:'${plan.tier}' AND metadata['userType']:'authenticated'`,
        });

        let authProduct: Stripe.Product;
        let authStripePrice: Stripe.Price;

        if (existingAuthProducts.data.length > 0) {
          authProduct = existingAuthProducts.data[0];
          const authPrices = await stripe.prices.list({
            product: authProduct.id,
            active: true,
            type: "recurring",
          });

          if (authPrices.data.length > 0) {
            authStripePrice = authPrices.data[0];
          } else {
            authStripePrice = await stripe.prices.create({
              product: authProduct.id,
              unit_amount: authPrice,
              currency: "usd",
              recurring: { interval: "month" },
            });
          }
        } else {
          // Create product for authenticated users
          authProduct = await stripe.products.create({
            name: `${plan.name} (Authenticated)`,
            description: `${plan.description} - Discounted for verified users`,
            metadata: {
              tier: plan.tier,
              userType: "authenticated",
            },
          });

          authStripePrice = await stripe.prices.create({
            product: authProduct.id,
            unit_amount: authPrice,
            currency: "usd",
            recurring: { interval: "month" },
          });
        }

        // Upsert authenticated user plan
        const existingAuthPlan = await db
          .select()
          .from(subscriptionPlans)
          .where(
            and(
              eq(subscriptionPlans.tier, plan.tier),
              eq(subscriptionPlans.userType, "authenticated")
            )
          );

        if (existingAuthPlan.length > 0) {
          await db
            .update(subscriptionPlans)
            .set({
              stripePriceId: authStripePrice.id,
              stripeProductId: authProduct.id,
              priceMonthly: authPrice,
              features: plan.features,
              isActive: true,
            })
            .where(
              and(
                eq(subscriptionPlans.tier, plan.tier),
                eq(subscriptionPlans.userType, "authenticated")
              )
            );
          console.log(`  Updated database plan for authenticated users`);
        } else {
          await db.insert(subscriptionPlans).values({
            tier: plan.tier,
            userType: "authenticated",
            stripePriceId: authStripePrice.id,
            stripeProductId: authProduct.id,
            priceMonthly: authPrice,
            features: plan.features,
            isActive: true,
          });
          console.log(`  Inserted database plan for authenticated users`);
        }
      }

      console.log(`  Done!\n`);
    } catch (error) {
      console.error(`  Error processing ${plan.name}:`, error);
    }
  }

  console.log("Stripe plans seed completed!");
  await connection.end();
  process.exit(0);
}

seedStripePlans().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
