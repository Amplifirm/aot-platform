import { Suspense } from "react";
import { Globe, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TargetCard, TargetCardSkeleton } from "@/components/targets/TargetCard";
import { SuggestButton } from "@/components/targets/SuggestButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Metadata } from "next";
import type { TargetWithStats } from "@/types";

export const metadata: Metadata = {
  title: "Countries",
  description: "Explore and score nations based on their historical accomplishments and offenses.",
};

async function getCountries(): Promise<TargetWithStats[]> {
  return [
    {
      id: "c1",
      slug: "united-states",
      name: "United States",
      targetType: "country",
      shortDescription: "Federal republic in North America, global superpower since WWII",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/320px-Flag_of_the_United_States.svg.png",
      wikipediaUrl: "https://en.wikipedia.org/wiki/United_States",
      avgAccomplishments: 7.5,
      avgOffenses: 5.2,
      avgTotal: 2.3,
      masterTotal: 2.0,
      authTotal: 2.5,
      totalVotes: 2100,
      registeredVotes: 800,
      authenticatedVotes: 350,
    },
    {
      id: "c2",
      slug: "united-kingdom",
      name: "United Kingdom",
      targetType: "country",
      shortDescription: "Constitutional monarchy, former global empire, cultural influence",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/320px-Flag_of_the_United_Kingdom_%283-5%29.svg.png",
      wikipediaUrl: "https://en.wikipedia.org/wiki/United_Kingdom",
      avgAccomplishments: 7.2,
      avgOffenses: 6.1,
      avgTotal: 1.1,
      masterTotal: 0.8,
      authTotal: 1.3,
      totalVotes: 1650,
      registeredVotes: 620,
      authenticatedVotes: 280,
    },
    {
      id: "c3",
      slug: "china",
      name: "China",
      targetType: "country",
      shortDescription: "Ancient civilization, most populous country, rising global power",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Flag_of_the_People%27s_Republic_of_China.svg/320px-Flag_of_the_People%27s_Republic_of_China.svg.png",
      wikipediaUrl: "https://en.wikipedia.org/wiki/China",
      avgAccomplishments: 7.8,
      avgOffenses: 5.5,
      avgTotal: 2.3,
      masterTotal: 1.8,
      authTotal: 2.6,
      totalVotes: 1890,
      registeredVotes: 720,
      authenticatedVotes: 310,
    },
    {
      id: "c4",
      slug: "india",
      name: "India",
      targetType: "country",
      shortDescription: "Ancient civilization, world's largest democracy, diverse culture",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png",
      wikipediaUrl: "https://en.wikipedia.org/wiki/India",
      avgAccomplishments: 7.2,
      avgOffenses: 3.8,
      avgTotal: 3.4,
      masterTotal: 3.5,
      authTotal: 3.2,
      totalVotes: 1580,
      registeredVotes: 600,
      authenticatedVotes: 260,
    },
  ];
}

function CountriesGrid({ countries }: { countries: TargetWithStats[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {countries.map((country) => (
        <TargetCard
          key={country.id}
          id={country.id}
          slug={country.slug}
          name={country.name}
          targetType={country.targetType}
          shortDescription={country.shortDescription}
          imageUrl={country.imageUrl}
          avgTotal={country.avgTotal}
          masterTotal={country.masterTotal}
          totalVotes={country.totalVotes}
        />
      ))}
    </div>
  );
}

function CountriesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <TargetCardSkeleton key={i} />
      ))}
    </div>
  );
}

async function CountriesContent() {
  const countries = await getCountries();
  return <CountriesGrid countries={countries} />;
}

export default function CountriesPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
            <Globe className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Countries</h1>
            <p className="text-sm text-muted-foreground">Nations and civilizations</p>
          </div>
        </div>
        <SuggestButton targetType="country" />
      </div>

      {/* Search and Filters */}
      <div className="card-elevated p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              className="pl-10 h-10 rounded-xl bg-muted/50 border-border/50"
            />
          </div>

          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-[140px] h-10 rounded-xl">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="asia">Asia</SelectItem>
              <SelectItem value="americas">Americas</SelectItem>
              <SelectItem value="africa">Africa</SelectItem>
              <SelectItem value="oceania">Oceania</SelectItem>
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
          Showing <span className="font-medium text-foreground">4</span> countries
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">7,220</span> total votes
        </p>
      </div>

      {/* Countries Grid */}
      <Suspense fallback={<CountriesGridSkeleton />}>
        <CountriesContent />
      </Suspense>

      {/* Load More */}
      <div className="mt-8 text-center">
        <Button variant="outline" className="rounded-xl">
          Load More Countries
        </Button>
      </div>

      {/* Suggest Section */}
      <div className="card-elevated p-6 mt-8 text-center">
        <h3 className="font-semibold mb-1">Missing a country?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Suggest a country or historical nation to be added
        </p>
        <SuggestButton targetType="country" variant="outline" label="Suggest a Country" />
      </div>
    </div>
  );
}
