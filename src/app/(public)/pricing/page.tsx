"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, Sparkles, Loader2, CreditCard, Crown, Zap, Star, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PRICING, getTierFeatures } from "@/lib/utils/permissions";
import { motion } from "framer-motion";
import { GradientText, FloatingOrb } from "@/components/ui/animated-background";

const tiers = [
  {
    name: "Free",
    tier: "T1",
    description: "Get started with basic scoring",
    features: getTierFeatures("T1"),
    popular: false,
    icon: Star,
    gradient: "from-slate-400 to-slate-600",
    glow: "shadow-slate-500/20",
  },
  {
    name: "Basic",
    tier: "T2",
    description: "Unlimited scoring potential",
    features: getTierFeatures("T2"),
    popular: false,
    icon: Zap,
    gradient: "from-blue-400 to-blue-600",
    glow: "shadow-blue-500/30",
  },
  {
    name: "Pro",
    tier: "T3",
    description: "Enhanced features for power users",
    features: getTierFeatures("T3"),
    popular: true,
    icon: Sparkles,
    gradient: "from-cyan-400 to-blue-500",
    glow: "shadow-cyan-500/40",
  },
  {
    name: "Premium",
    tier: "T4",
    description: "Extended explanations and more",
    features: getTierFeatures("T4"),
    popular: false,
    icon: Crown,
    gradient: "from-purple-400 to-violet-600",
    glow: "shadow-purple-500/30",
  },
  {
    name: "Ultimate",
    tier: "T5",
    description: "Everything, unlimited",
    features: getTierFeatures("T5"),
    popular: false,
    icon: Rocket,
    gradient: "from-amber-400 to-orange-500",
    glow: "shadow-amber-500/30",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const featureVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

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
    <div className="max-w-7xl mx-auto relative">
      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingOrb
          color="rgba(34, 211, 238, 0.15)"
          size={400}
          initialX={-100}
          initialY={-50}
          duration={20}
        />
        <FloatingOrb
          color="rgba(168, 85, 247, 0.12)"
          size={350}
          initialX={800}
          initialY={300}
          duration={25}
        />
        <FloatingOrb
          color="rgba(236, 72, 153, 0.1)"
          size={300}
          initialX={400}
          initialY={600}
          duration={22}
        />
      </div>

      {/* Header */}
      <motion.div
        className="text-center mb-12 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex items-center justify-center gap-3 mb-6"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <CreditCard className="h-7 w-7 text-white" />
          </div>
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Choose Your <GradientText>Plan</GradientText>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-lg">
          Upgrade your AOT experience with more features and longer explanations
        </p>

        {userType === "authenticated" && (
          <motion.div
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium glass-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-emerald-400">Authenticated user - enjoy discounted pricing!</span>
          </motion.div>
        )}

        {/* Billing toggle */}
        <motion.div
          className="flex items-center justify-center gap-4 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Label
            htmlFor="billing"
            className={cn(
              "text-sm cursor-pointer transition-colors",
              !isYearly && "text-foreground font-semibold"
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
              isYearly && "text-foreground font-semibold"
            )}
          >
            Yearly
            <Badge className="bg-gradient-to-r from-emerald-400 to-green-500 text-white border-0 shadow-lg shadow-emerald-500/30">
              Save 17%
            </Badge>
          </Label>
        </motion.div>
      </motion.div>

      {/* Pricing Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-16 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {tiers.map((tier, index) => {
          const price = getPrice(tier.tier);
          const isCurrentTier = tier.tier === currentTier;
          const isLoading = loadingTier === tier.tier;
          const Icon = tier.icon;

          return (
            <motion.div
              key={tier.tier}
              variants={cardVariants}
              whileHover={{
                y: -8,
                transition: { type: "spring", stiffness: 300 },
              }}
              className="relative"
            >
              <Card
                variant="glass"
                className={cn(
                  "p-5 flex flex-col relative overflow-hidden h-full transition-all duration-300",
                  tier.popular && "ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-500/20",
                  isCurrentTier && "ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-500/20",
                  "hover:shadow-xl",
                  tier.glow
                )}
              >
                {/* Popular glow effect */}
                {tier.popular && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10"
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                {tier.popular && (
                  <motion.div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 z-20"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <Badge className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white border-0 px-3 py-1 shadow-lg shadow-cyan-500/30">
                      <Sparkles className="h-3 w-3" />
                      Most Popular
                    </Badge>
                  </motion.div>
                )}
                {isCurrentTier && !tier.popular && (
                  <motion.div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 z-20"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <Badge className="bg-gradient-to-r from-emerald-400 to-green-500 text-white border-0 px-3 py-1 shadow-lg shadow-emerald-500/30">
                      <Check className="h-3 w-3 mr-1" />
                      Current
                    </Badge>
                  </motion.div>
                )}

                <CardContent className="p-0 flex flex-col flex-1 relative z-10">
                  {/* Tier Header */}
                  <div className="text-center mb-5 pt-3">
                    <motion.div
                      className={cn(
                        "w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br shadow-lg",
                        tier.gradient
                      )}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <h3 className="font-bold text-lg">{tier.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tier.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-5">
                    {price.monthly === 0 ? (
                      <motion.div
                        className="text-3xl font-bold"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: index * 0.1 }}
                      >
                        Free
                      </motion.div>
                    ) : (
                      <>
                        <motion.div
                          className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: index * 0.1 }}
                        >
                          ${isYearly ? price.yearly : price.monthly}
                        </motion.div>
                        <div className="text-xs text-muted-foreground mt-1">
                          /{isYearly ? "year" : "month"}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <motion.ul
                    className="space-y-2.5 mb-6 flex-1"
                    variants={{
                      visible: {
                        transition: { staggerChildren: 0.05, delayChildren: 0.3 },
                      },
                    }}
                  >
                    {tier.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        variants={featureVariants}
                        className="flex items-start gap-2.5 text-xs"
                      >
                        <motion.div
                          className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-emerald-500/30"
                          whileHover={{ scale: 1.2 }}
                        >
                          <Check className="h-2.5 w-2.5 text-white" />
                        </motion.div>
                        <span className="text-muted-foreground">{feature}</span>
                      </motion.li>
                    ))}
                  </motion.ul>

                  {/* CTA */}
                  <Button
                    className={cn(
                      "w-full rounded-xl relative overflow-hidden",
                      tier.popular && "shadow-lg shadow-primary/30"
                    )}
                    variant={tier.popular ? "glow" : "outline"}
                    disabled={
                      isCurrentTier ||
                      tier.tier === "T1" ||
                      status === "loading" ||
                      isLoading
                    }
                    onClick={() => handleSelectTier(tier.tier)}
                  >
                    {tier.popular && !isLoading && !isCurrentTier && tier.tier !== "T1" && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isCurrentTier ? (
                        "Current Plan"
                      ) : tier.tier === "T1" ? (
                        "Free Forever"
                      ) : (
                        <>
                          Upgrade
                          <Zap className="h-3.5 w-3.5" />
                        </>
                      )}
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        className="max-w-2xl mx-auto relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center mb-8">
          Frequently Asked <GradientText>Questions</GradientText>
        </h2>
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              question: "What's the difference between user types?",
              answer: (
                <>
                  <strong className="text-foreground">Authenticated</strong> users sign in with Google or Twitter
                  and get discounted pricing plus T2 features for free.{" "}
                  <strong className="text-foreground">Registered</strong> users create accounts with email/password.
                </>
              ),
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
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card variant="glass" className="p-5 hover-glow">
                <CardContent className="p-0">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">?</span>
                    </div>
                    {faq.question}
                  </h3>
                  <p className="text-sm text-muted-foreground pl-8">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
