import Link from "next/link";
import { ArrowRight, Users, Globe, Lightbulb, TrendingUp, Award, Activity, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="p-4">
      <CardContent className="p-0 flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground mb-0.5">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryCard({
  title,
  description,
  icon: Icon,
  href,
  count,
  color,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  count: number;
  color: string;
}) {
  return (
    <Link href={href} className="block group">
      <Card className="p-4 h-full hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground font-medium">
              {count}
            </span>
          </div>
          <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors flex items-center gap-1">
            {title}
            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function RankedItem({
  rank,
  name,
  type,
  score,
  slug,
}: {
  rank: number;
  name: string;
  type: "person" | "country" | "idea";
  score: number;
  slug: string;
}) {
  const typeRoutes = {
    person: "people",
    country: "countries",
    idea: "ideas",
  };

  const rankStyles: Record<number, string> = {
    1: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    2: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    3: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  };

  return (
    <Link
      href={`/${typeRoutes[type]}/${slug}`}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors group"
    >
      <div className={`w-7 h-7 rounded-md ${rankStyles[rank] || "bg-muted text-muted-foreground"} flex items-center justify-center font-semibold text-xs`}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{name}</p>
        <p className="text-xs text-muted-foreground capitalize">{type}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${score >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
          {score >= 0 ? "+" : ""}{score}
        </p>
      </div>
    </Link>
  );
}

function HowItWorks() {
  const items = [
    { letter: "A", label: "Accomplishments", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { letter: "-", label: "", isOperator: true },
    { letter: "O", label: "Offenses", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    { letter: "=", label: "", isOperator: true },
    { letter: "T", label: "Total", color: "bg-primary/10 text-primary" },
  ];

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          How A-O=T Works
        </h3>
        <div className="flex items-center justify-between gap-2">
          {items.map((item, index) => (
            <div key={index} className="flex-1 text-center">
              {item.isOperator ? (
                <span className="text-muted-foreground text-xl font-light">{item.letter}</span>
              ) : (
                <>
                  <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mx-auto mb-1.5`}>
                    <span className="text-lg font-bold">{item.letter}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border">
          <Link href="/register">
            <Button className="w-full">
              Start Scoring
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({
  icon: Icon,
  label,
  sublabel,
  href,
  color,
}: {
  icon: React.ElementType;
  label: string;
  sublabel: string;
  href: string;
  color: string;
}) {
  return (
    <Link href={href} className="block group">
      <Card className="p-3 hover:shadow-md transition-shadow">
        <CardContent className="p-0 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm group-hover:text-primary transition-colors">{label}</p>
            <p className="text-xs text-muted-foreground">{sublabel}</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const topRanked = [
    { rank: 1, name: "Mahatma Gandhi", type: "person" as const, score: 9, slug: "mahatma-gandhi" },
    { rank: 2, name: "Albert Einstein", type: "person" as const, score: 8, slug: "albert-einstein" },
    { rank: 3, name: "Democracy", type: "idea" as const, score: 7, slug: "democracy" },
    { rank: 4, name: "United States", type: "country" as const, score: 6, slug: "united-states" },
    { rank: 5, name: "Marie Curie", type: "person" as const, score: 6, slug: "marie-curie" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Welcome to AOT
        </h1>
        <p className="text-muted-foreground text-sm">
          Score history&apos;s most influential people, countries, and ideas.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard title="Total Targets" value="14" icon={Target} color="bg-primary/10 text-primary" />
        <StatCard title="People" value="6" icon={Users} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
        <StatCard title="Countries" value="4" icon={Globe} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
        <StatCard title="Ideas" value="4" icon={Lightbulb} color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Left Column - Categories */}
        <div className="lg:col-span-2 space-y-4">
          {/* Categories */}
          <div>
            <h2 className="font-semibold text-sm mb-3">Browse Categories</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              <CategoryCard
                title="People"
                description="Historical figures and leaders"
                icon={Users}
                href="/people"
                count={6}
                color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              />
              <CategoryCard
                title="Countries"
                description="Nations and civilizations"
                icon={Globe}
                href="/countries"
                count={4}
                color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              />
              <CategoryCard
                title="Ideas"
                description="Ideologies and movements"
                icon={Lightbulb}
                href="/ideas"
                count={4}
                color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="font-semibold text-sm mb-3">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <QuickAction
                icon={Users}
                label="Score People"
                sublabel="6 targets available"
                href="/people"
                color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              />
              <QuickAction
                icon={Globe}
                label="Score Countries"
                sublabel="4 nations available"
                href="/countries"
                color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
              />
              <QuickAction
                icon={Lightbulb}
                label="Score Ideas"
                sublabel="4 concepts available"
                href="/ideas"
                color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
              />
              <QuickAction
                icon={TrendingUp}
                label="Join Groups"
                sublabel="Collaborate on scores"
                href="/groups"
                color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Top Ranked */}
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  Top Ranked
                </h3>
                <Link href="/scores">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-1">
                {topRanked.map((item) => (
                  <RankedItem key={item.slug} {...item} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How it Works */}
          <HowItWorks />

          {/* Activity Card */}
          <Card className="p-4">
            <CardContent className="p-0">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Recent Activity</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                No recent activity yet. Start scoring to see your activity here!
              </p>
              <Link href="/people">
                <Button variant="outline" size="sm" className="w-full">
                  Start Scoring
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
