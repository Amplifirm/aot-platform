"use client";

import Link from "next/link";
import { ArrowRight, Users, Globe, Lightbulb, TrendingUp, Award, Activity, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem, FadeIn } from "@/components/ui/stagger-container";
import { GradientText, FloatingOrb } from "@/components/ui/animated-background";

// Animated Stat Card with glow effects
function StatCard({
  title,
  value,
  icon: Icon,
  accentColor = "cyan",
  delay = 0,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  accentColor?: "cyan" | "green" | "blue" | "purple";
  delay?: number;
}) {
  const colors = {
    cyan: "bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/10 dark:text-cyan-400",
    green: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400",
    purple: "bg-violet-500/10 text-violet-500 dark:bg-violet-400/10 dark:text-violet-400",
  };

  const glowColors = {
    cyan: "hover:shadow-cyan-500/20 dark:hover:shadow-cyan-400/30",
    green: "hover:shadow-emerald-500/20 dark:hover:shadow-emerald-400/30",
    blue: "hover:shadow-blue-500/20 dark:hover:shadow-blue-400/30",
    purple: "hover:shadow-violet-500/20 dark:hover:shadow-violet-400/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card variant="glass" className={`p-5 hover-lift ${glowColors[accentColor]} hover:shadow-xl transition-all duration-300`}>
        <CardContent className="p-0 flex items-start gap-4">
          <motion.div
            className={`w-12 h-12 rounded-xl ${colors[accentColor]} flex items-center justify-center flex-shrink-0`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Icon className="h-6 w-6" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <motion.p
              className="text-3xl font-bold tracking-tight"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: delay + 0.2 }}
            >
              {value}
            </motion.p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Animated Category Card with hover effects
function CategoryCard({
  title,
  description,
  icon: Icon,
  href,
  count,
  accentColor,
  delay = 0,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  count: number;
  accentColor: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link href={href} className="block group">
        <Card variant="glass" className="p-5 h-full hover-lift hover:shadow-xl dark:hover:shadow-primary/10 transition-all duration-300">
          <CardContent className="p-0">
            <div className="flex items-start justify-between mb-4">
              <motion.div
                className={`w-11 h-11 rounded-xl ${accentColor} flex items-center justify-center`}
                whileHover={{ scale: 1.15, rotate: -10 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>
              <motion.span
                className="text-xs bg-muted/50 backdrop-blur-sm px-2.5 py-1 rounded-full text-muted-foreground font-medium border border-border/30"
                whileHover={{ scale: 1.1 }}
              >
                {count}
              </motion.span>
            </div>
            <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
              {title}
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="inline-block"
              >
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all" />
              </motion.span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

// Animated Ranked Item
function RankedItem({
  rank,
  name,
  type,
  score,
  slug,
  delay = 0,
}: {
  rank: number;
  name: string;
  type: "person" | "country" | "idea";
  score: number;
  slug: string;
  delay?: number;
}) {
  const typeRoutes = {
    person: "people",
    country: "countries",
    idea: "ideas",
  };

  const rankStyles = {
    1: "bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/30",
    2: "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 shadow-lg shadow-slate-400/30",
    3: "bg-gradient-to-br from-orange-400 to-amber-600 text-white shadow-lg shadow-orange-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Link
        href={`/${typeRoutes[type]}/${slug}`}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-all group"
      >
        <motion.div
          className={`w-8 h-8 rounded-lg ${rankStyles[rank as 1 | 2 | 3] || "bg-muted text-muted-foreground"} flex items-center justify-center font-bold text-sm`}
          whileHover={{ scale: 1.15, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {rank}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{name}</p>
          <p className="text-xs text-muted-foreground capitalize">{type}</p>
        </div>
        <div className="text-right">
          <motion.p
            className={`text-sm font-bold ${score >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}
            whileHover={{ scale: 1.1 }}
          >
            {score >= 0 ? "+" : ""}{score}
          </motion.p>
        </div>
      </Link>
    </motion.div>
  );
}

// How AOT Works with animations
function HowItWorks() {
  const items = [
    { letter: "A", label: "Accomplishments", color: "from-emerald-400 to-green-500", shadowColor: "shadow-emerald-500/40" },
    { letter: "-", label: "", isOperator: true },
    { letter: "O", label: "Offenses", color: "from-red-400 to-rose-500", shadowColor: "shadow-red-500/40" },
    { letter: "=", label: "", isOperator: true },
    { letter: "T", label: "Total", color: "from-cyan-400 to-blue-500", shadowColor: "shadow-cyan-500/40" },
  ];

  return (
    <Card variant="glass" className="p-5">
      <CardContent className="p-0">
        <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          How A-O=T Works
        </h3>
        <div className="flex items-center justify-between gap-2">
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="flex-1 text-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              {item.isOperator ? (
                <span className="text-muted-foreground text-2xl font-light">{item.letter}</span>
              ) : (
                <>
                  <motion.div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-2 shadow-lg ${item.shadowColor}`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <span className="text-xl font-bold text-white">{item.letter}</span>
                  </motion.div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </>
              )}
            </motion.div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-border/30">
          <Link href="/register">
            <Button variant="glow" size="lg" className="w-full">
              Start Scoring
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Action Button with animations
function QuickAction({
  icon: Icon,
  label,
  sublabel,
  href,
  color,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  href: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Link href={href} className="block group">
        <Card variant="glass" className="p-4 hover-lift transition-all duration-300">
          <CardContent className="p-0 flex items-center gap-3">
            <motion.div
              className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Icon className="h-5 w-5" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm group-hover:text-primary transition-colors">{label}</p>
              <p className="text-xs text-muted-foreground">{sublabel}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

// Main Dashboard Page
export default function DashboardPage() {
  const topRanked = [
    { rank: 1, name: "Mahatma Gandhi", type: "person" as const, score: 9, slug: "mahatma-gandhi" },
    { rank: 2, name: "Albert Einstein", type: "person" as const, score: 8, slug: "albert-einstein" },
    { rank: 3, name: "Democracy", type: "idea" as const, score: 7, slug: "democracy" },
    { rank: 4, name: "United States", type: "country" as const, score: 6, slug: "united-states" },
    { rank: 5, name: "Marie Curie", type: "person" as const, score: 6, slug: "marie-curie" },
  ];

  return (
    <div className="max-w-7xl mx-auto relative">
      {/* Decorative floating orbs */}
      <FloatingOrb color="cyan" size="lg" className="top-0 right-0 opacity-20" />
      <FloatingOrb color="purple" size="md" className="bottom-1/3 left-0 opacity-15" />

      {/* Welcome Header with gradient text */}
      <FadeIn className="mb-8">
        <motion.h1
          className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to <GradientText>AOT</GradientText>
        </motion.h1>
        <motion.p
          className="text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Score history&apos;s most influential people, countries, and ideas.
        </motion.p>
      </FadeIn>

      {/* Stats Grid with staggered animation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Targets" value="14" icon={Target} accentColor="cyan" delay={0} />
        <StatCard title="People" value="6" icon={Users} accentColor="blue" delay={0.1} />
        <StatCard title="Countries" value="4" icon={Globe} accentColor="green" delay={0.2} />
        <StatCard title="Ideas" value="4" icon={Lightbulb} accentColor="purple" delay={0.3} />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column - Categories */}
        <div className="lg:col-span-2 space-y-6">
          {/* Categories */}
          <div>
            <motion.div
              className="flex items-center justify-between mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="font-semibold text-lg">Browse Categories</h2>
            </motion.div>
            <div className="grid sm:grid-cols-3 gap-4">
              <CategoryCard
                title="People"
                description="Historical figures and leaders"
                icon={Users}
                href="/people"
                count={6}
                accentColor="bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400"
                delay={0.5}
              />
              <CategoryCard
                title="Countries"
                description="Nations and civilizations"
                icon={Globe}
                href="/countries"
                count={4}
                accentColor="bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400"
                delay={0.6}
              />
              <CategoryCard
                title="Ideas"
                description="Ideologies and movements"
                icon={Lightbulb}
                href="/ideas"
                count={4}
                accentColor="bg-violet-500/10 text-violet-500 dark:bg-violet-400/10 dark:text-violet-400"
                delay={0.7}
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <motion.h2
              className="font-semibold text-lg mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Quick Actions
            </motion.h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <QuickAction
                icon={Users}
                label="Score People"
                sublabel="6 targets available"
                href="/people"
                color="bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400"
                delay={0.9}
              />
              <QuickAction
                icon={Globe}
                label="Score Countries"
                sublabel="4 nations available"
                href="/countries"
                color="bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400"
                delay={1.0}
              />
              <QuickAction
                icon={Lightbulb}
                label="Score Ideas"
                sublabel="4 concepts available"
                href="/ideas"
                color="bg-violet-500/10 text-violet-500 dark:bg-violet-400/10 dark:text-violet-400"
                delay={1.1}
              />
              <QuickAction
                icon={TrendingUp}
                label="Join Groups"
                sublabel="Collaborate on scores"
                href="/groups"
                color="bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400"
                delay={1.2}
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Ranked */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card variant="glass" className="p-5">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-500" />
                    Top Ranked
                  </h3>
                  <Link href="/scores">
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      View All
                    </Button>
                  </Link>
                </div>
                <div className="space-y-1">
                  {topRanked.map((item, index) => (
                    <RankedItem key={item.slug} {...item} delay={0.7 + index * 0.1} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* How it Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <HowItWorks />
          </motion.div>

          {/* Activity Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <Card variant="glass" className="p-5">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Recent Activity</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  No recent activity yet. Start scoring to see your activity here!
                </p>
                <Link href="/people" className="block mt-4">
                  <Button variant="outline" className="w-full">
                    Start Scoring
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
