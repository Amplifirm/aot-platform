"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, Loader2, CreditCard, Crown, Zap, Star, Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PRICING, getTierFeatures } from "@/lib/utils/permissions";

const tiers = [
  {
    name: "Free",
    tier: "T1",
    description: "Get started with basic scoring",
    features: getTierFeatures("T1"),
    popular: false,
    icon: Star,
    color: "text-slate-500",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  },
  {
    name: "Basic",
    tier: "T2",
    description: "Unlimited scoring potential",
    features: getTierFeatures("T2"),
    popular: false,
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    name: "Pro",
    tier: "T3",
    description: "Enhanced features for power users",
    features: getTierFeatures("T3"),
    popular: true,
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    name: "Premium",
    tier: "T4",
    description: "Extended explanations and more",
    features: getTierFeatures("T4"),
    popular: false,
    icon: Crown,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    name: "Ultimate",
    tier: "T5",
    description: "Everything, unlimited",
    features: getTierFeatures("T5"),
    popular: false,
    icon: Rocket,
    color: "text-amber-500",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const userType = session?.user?.userType || "registered";
  const currentTier = session?.user?.subscriptionTier || "T1";

  const getPrice = (tier: string) => {
    const tierKey = tier as keyof typeof PRICING.registered;
    const priceType = userType === "authenticated" ? "authenticated" : "registered";
    const monthlyPrice = PRICING[priceType][tierKey];
    if (monthlyPrice === 0) return { monthly: 0, yearly: 0 };
    const yearlyPrice = Math.round(monthlyPrice * 10);
    return {
      monthly: monthlyPrice / 100,
      yearly: yearlyPrice / 100,
    };
  };

  const handleSelectTier = async (tier: string) => {
    if (!session?.user) {
      router.push("/login?callbackUrl=/pricing");
      return;
    }

    if (tier === "T1" || tier === currentTier) {
      return;
    }

    setLoadingTier(tier);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      window.location.href = data.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to start checkout";
      toast.error(message);
      setLoadingTier(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Upgrade your AOT experience with more features and longer explanations
        </p>

        {userType === "authenticated" && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <Check className="h-4 w-4" />
            <span>Authenticated user - enjoy discounted pricing!</span>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Label
            htmlFor="billing"
            className={cn(
              "text-sm cursor-pointer transition-colors",
              !isYearly && "text-foreground font-medium"
            )}
          >
            Monthly
          </Label>
          <Switch
            id="billing"
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label
            htmlFor="billing"
            className={cn(
              "text-sm cursor-pointer flex items-center gap-2 transition-colors",
              isYearly && "text-foreground font-medium"
            )}
          >
            Yearly
            <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
              Save 17%
            </Badge>
          </Label>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
        {tiers.map((tier) => {
          const price = getPrice(tier.tier);
          const isCurrentTier = tier.tier === currentTier;
          const isLoading = loadingTier === tier.tier;
          const Icon = tier.icon;

          return (
            <div
              key={tier.tier}
              className={cn(
                "relative bg-card border rounded-lg p-5 flex flex-col",
                tier.popular && "border-primary ring-1 ring-primary",
                isCurrentTier && "border-emerald-500 ring-1 ring-emerald-500"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              {isCurrentTier && !tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-emerald-500 text-white">
                    Current
                  </Badge>
                </div>
              )}

              {/* Tier Header */}
              <div className="text-center mb-4 pt-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg mx-auto mb-3 flex items-center justify-center",
                    tier.bgColor
                  )}
                >
                  <Icon className={cn("h-5 w-5", tier.color)} />
                </div>
                <h3 className="font-semibold text-lg">{tier.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {tier.description}
                </p>
              </div>

              {/* Price */}
              <div className="text-center mb-4">
                {price.monthly === 0 ? (
                  <div className="text-2xl font-bold">Free</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      ${isYearly ? price.yearly : price.monthly}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      /{isYearly ? "year" : "month"}
                    </div>
                  </>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-5 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                className="w-full"
                variant={tier.popular ? "default" : "outline"}
                disabled={
                  isCurrentTier ||
                  tier.tier === "T1" ||
                  status === "loading" ||
                  isLoading
                }
                onClick={() => handleSelectTier(tier.tier)}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isCurrentTier ? (
                  "Current Plan"
                ) : tier.tier === "T1" ? (
                  "Free Forever"
                ) : (
                  <>
                    Upgrade
                    <Zap className="h-3.5 w-3.5 ml-1" />
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-center mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {[
            {
              question: "What's the difference between user types?",
              answer:
                "Authenticated users sign in with Google or Twitter and get discounted pricing plus T2 features for free. Registered users create accounts with email/password.",
            },
            {
              question: "Can I change my plan later?",
              answer:
                "Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
            },
            {
              question: "What payment methods do you accept?",
              answer:
                "We accept all major credit cards, debit cards, and PayPal through our secure payment processor, Stripe.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-4"
            >
              <h3 className="font-medium text-sm mb-1">{faq.question}</h3>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
