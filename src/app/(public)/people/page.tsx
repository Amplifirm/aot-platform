import { Suspense } from "react";
import { Users, Plus, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TargetCard, TargetCardSkeleton } from "@/components/targets/TargetCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Metadata } from "next";
import type { TargetWithStats } from "@/types";

export const metadata: Metadata = {
  title: "People",
  description: "Explore and score historical figures, leaders, innovators, and influential personalities.",
};

async function getPeople(): Promise<TargetWithStats[]> {
  return [
    {
      id: "1",
      slug: "mahatma-gandhi",
      name: "Mahatma Gandhi",
      targetType: "person",
      shortDescription: "Leader of Indian independence movement, advocate of nonviolent civil disobedience",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Mahatma-Gandhi%2C_studio%2C_1931.jpg/220px-Mahatma-Gandhi%2C_studio%2C_1931.jpg",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Mahatma_Gandhi",
      avgAccomplishments: 8.5,
      avgOffenses: 2.1,
      avgTotal: 6.4,
      masterTotal: 7.0,
      authTotal: 6.8,
      totalVotes: 1250,
      registeredVotes: 450,
      authenticatedVotes: 200,
    },
    {
      id: "2",
      slug: "albert-einstein",
      name: "Albert Einstein",
      targetType: "person",
      shortDescription: "Theoretical physicist, developed theory of relativity, Nobel Prize winner",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Einstein_1921_by_F_Schmutzer_-_restoration.jpg/220px-Einstein_1921_by_F_Schmutzer_-_restoration.jpg",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Albert_Einstein",
      avgAccomplishments: 9.2,
      avgOffenses: 1.5,
      avgTotal: 7.7,
      masterTotal: 8.5,
      authTotal: 7.9,
      totalVotes: 980,
      registeredVotes: 380,
      authenticatedVotes: 180,
    },
    {
      id: "3",
      slug: "napoleon-bonaparte",
      name: "Napoleon Bonaparte",
      targetType: "person",
      shortDescription: "French military commander, Emperor, major figure in European history",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg/220px-Jacques-Louis_David_-_The_Emperor_Napoleon_in_His_Study_at_the_Tuileries_-_Google_Art_Project.jpg",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Napoleon",
      avgAccomplishments: 7.8,
      avgOffenses: 6.5,
      avgTotal: 1.3,
      masterTotal: 0.5,
      authTotal: 1.8,
      totalVotes: 870,
      registeredVotes: 340,
      authenticatedVotes: 150,
    },
    {
      id: "4",
      slug: "nelson-mandela",
      name: "Nelson Mandela",
      targetType: "person",
      shortDescription: "Anti-apartheid revolutionary, first Black president of South Africa",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nelson_Mandela_1994.jpg/220px-Nelson_Mandela_1994.jpg",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Nelson_Mandela",
      avgAccomplishments: 9.1,
      avgOffenses: 1.8,
      avgTotal: 7.3,
      masterTotal: 8.0,
      authTotal: 7.5,
      totalVotes: 1120,
      registeredVotes: 420,
      authenticatedVotes: 190,
    },
    {
      id: "5",
      slug: "martin-luther-king-jr",
      name: "Martin Luther King Jr.",
      targetType: "person",
      shortDescription: "Civil rights leader, advocate of nonviolent resistance, Nobel Peace Prize winner",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Martin_Luther_King%2C_Jr..jpg/220px-Martin_Luther_King%2C_Jr..jpg",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Martin_Luther_King_Jr.",
      avgAccomplishments: 9.0,
      avgOffenses: 1.5,
      avgTotal: 7.5,
      masterTotal: 8.2,
      authTotal: 7.8,
      totalVotes: 1050,
      registeredVotes: 400,
      authenticatedVotes: 175,
    },
    {
      id: "6",
      slug: "winston-churchill",
      name: "Winston Churchill",
      targetType: "person",
      shortDescription: "British Prime Minister during WWII, Nobel Prize in Literature",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Sir_Winston_Churchill_-_19086236948.jpg/220px-Sir_Winston_Churchill_-_19086236948.jpg",
      wikipediaUrl: "https://en.wikipedia.org/wiki/Winston_Churchill",
      avgAccomplishments: 8.0,
      avgOffenses: 4.5,
      avgTotal: 3.5,
      masterTotal: 4.0,
      authTotal: 3.2,
      totalVotes: 890,
      registeredVotes: 350,
      authenticatedVotes: 160,
    },
  ];
}

function PeopleGrid({ people }: { people: TargetWithStats[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {people.map((person) => (
        <TargetCard
          key={person.id}
          id={person.id}
          slug={person.slug}
          name={person.name}
          targetType={person.targetType}
          shortDescription={person.shortDescription}
          imageUrl={person.imageUrl}
          avgTotal={person.avgTotal}
          masterTotal={person.masterTotal}
          totalVotes={person.totalVotes}
        />
      ))}
    </div>
  );
}

function PeopleGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <TargetCardSkeleton key={i} />
      ))}
    </div>
  );
}

async function PeopleContent() {
  const people = await getPeople();
  return <PeopleGrid people={people} />;
}

export default function PeoplePage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">People</h1>
            <p className="text-sm text-muted-foreground">Historical figures and leaders</p>
          </div>
        </div>
        <Button size="sm" className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Suggest Person
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="card-elevated p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              className="pl-10 h-10 rounded-xl bg-muted/50 border-border/50"
            />
          </div>

          <Select defaultValue="popular">
            <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="highest">Highest Score</SelectItem>
              <SelectItem value="lowest">Lowest Score</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">6</span> people
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">6,160</span> total votes
        </p>
      </div>

      {/* People Grid */}
      <Suspense fallback={<PeopleGridSkeleton />}>
        <PeopleContent />
      </Suspense>

      {/* Load More */}
      <div className="mt-8 text-center">
        <Button variant="outline" className="rounded-xl">
          Load More People
        </Button>
      </div>

      {/* Suggest Section */}
      <div className="card-elevated p-6 mt-8 text-center">
        <h3 className="font-semibold mb-1">Can&apos;t find who you&apos;re looking for?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Suggest a new historical figure to be added to our database
        </p>
        <Button variant="outline" size="sm" className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Suggest a Person
        </Button>
      </div>
    </div>
  );
}
