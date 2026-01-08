import { Suspense } from "react";
import { Lightbulb, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TargetCard, TargetCardSkeleton } from "@/components/targets/TargetCard";
import { SuggestButton } from "@/components/targets/SuggestButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Metadata } from "next";
import type { TargetWithStats } from "@/types";

export const metadata: Metadata = {
  title: "Ideas",
  description: "Explore and score ideologies, movements, policies, and philosophies that have shaped human society.",
};

async function getIdeas(): Promise<TargetWithStats[]> {
  return [
    {
      id: "i1",
      slug: "democracy",
      name: "Democracy",
      targetType: "idea",
      shortDescription: "System of government where power is vested in the people through voting",
      imageUrl: null,
      wikipediaUrl: "https://en.wikipedia.org/wiki/Democracy",
      avgAccomplishments: 8.2,
      avgOffenses: 2.8,
      avgTotal: 5.4,
      masterTotal: 5.8,
      authTotal: 5.2,
      totalVotes: 1820,
      registeredVotes: 680,
      authenticatedVotes: 290,
    },
    {
      id: "i2",
      slug: "capitalism",
      name: "Capitalism",
      targetType: "idea",
      shortDescription: "Economic system based on private ownership and free market competition",
      imageUrl: null,
      wikipediaUrl: "https://en.wikipedia.org/wiki/Capitalism",
      avgAccomplishments: 7.0,
      avgOffenses: 5.5,
      avgTotal: 1.5,
      masterTotal: 1.2,
      authTotal: 1.8,
      totalVotes: 1650,
      registeredVotes: 610,
      authenticatedVotes: 270,
    },
    {
      id: "i3",
      slug: "socialism",
      name: "Socialism",
      targetType: "idea",
      shortDescription: "Economic and political system emphasizing collective ownership and social equality",
      imageUrl: null,
      wikipediaUrl: "https://en.wikipedia.org/wiki/Socialism",
      avgAccomplishments: 6.5,
      avgOffenses: 5.0,
      avgTotal: 1.5,
      masterTotal: 1.0,
      authTotal: 2.0,
      totalVotes: 1420,
      registeredVotes: 530,
      authenticatedVotes: 230,
    },
    {
      id: "i4",
      slug: "environmentalism",
      name: "Environmentalism",
      targetType: "idea",
      shortDescription: "Movement focused on protecting the natural environment from human impact",
      imageUrl: null,
      wikipediaUrl: "https://en.wikipedia.org/wiki/Environmentalism",
      avgAccomplishments: 8.5,
      avgOffenses: 2.0,
      avgTotal: 6.5,
      masterTotal: 6.8,
      authTotal: 6.2,
      totalVotes: 1380,
      registeredVotes: 510,
      authenticatedVotes: 220,
    },
  ];
}

function IdeasGrid({ ideas }: { ideas: TargetWithStats[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {ideas.map((idea) => (
        <TargetCard
          key={idea.id}
          id={idea.id}
          slug={idea.slug}
          name={idea.name}
          targetType={idea.targetType}
          shortDescription={idea.shortDescription}
          imageUrl={idea.imageUrl}
          avgTotal={idea.avgTotal}
          masterTotal={idea.masterTotal}
          totalVotes={idea.totalVotes}
        />
      ))}
    </div>
  );
}

function IdeasGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <TargetCardSkeleton key={i} />
      ))}
    </div>
  );
}

async function IdeasContent() {
  const ideas = await getIdeas();
  return <IdeasGrid ideas={ideas} />;
}

export default function IdeasPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Ideas</h1>
            <p className="text-sm text-muted-foreground">Ideologies and movements</p>
          </div>
        </div>
        <SuggestButton targetType="idea" />
      </div>

      {/* Search and Filters */}
      <div className="card-elevated p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ideas..."
              className="pl-10 h-10 rounded-xl bg-muted/50 border-border/50"
            />
          </div>

          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="political">Political</SelectItem>
              <SelectItem value="economic">Economic</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="philosophical">Philosophical</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="popular">
            <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="highest">Highest Score</SelectItem>
              <SelectItem value="lowest">Lowest Score</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">4</span> ideas
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">6,270</span> total votes
        </p>
      </div>

      {/* Ideas Grid */}
      <Suspense fallback={<IdeasGridSkeleton />}>
        <IdeasContent />
      </Suspense>

      {/* Load More */}
      <div className="mt-8 text-center">
        <Button variant="outline" className="rounded-xl">
          Load More Ideas
        </Button>
      </div>

      {/* Suggest Section */}
      <div className="card-elevated p-6 mt-8 text-center">
        <h3 className="font-semibold mb-1">Have an idea to add?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Suggest a policy, ideology, or movement to be added
        </p>
        <SuggestButton targetType="idea" variant="outline" label="Suggest an Idea" />
      </div>
    </div>
  );
}
