import Link from "next/link";
import { TrendingUp, TrendingDown, Users, Globe, Lightbulb, ArrowRight, Star, Award, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge, ScoreInline } from "@/components/scoring/ScoreDisplay";
import { TargetCardHorizontal } from "@/components/targets/TargetCard";
import type { Metadata } from "next";
import type { TargetWithStats } from "@/types";

export const metadata: Metadata = {
  title: "Scores",
  description: "View the top-rated and lowest-rated People, Countries, and Ideas on AOT.",
};

// Mock data
const mockTopPeople: TargetWithStats[] = [
  {
    id: "1",
    slug: "albert-einstein",
    name: "Albert Einstein",
    targetType: "person",
    shortDescription: "Theoretical physicist, developed theory of relativity",
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
    id: "2",
    slug: "martin-luther-king-jr",
    name: "Martin Luther King Jr.",
    targetType: "person",
    shortDescription: "Civil rights leader, Nobel Peace Prize winner",
    imageUrl: null,
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
    id: "3",
    slug: "nelson-mandela",
    name: "Nelson Mandela",
    targetType: "person",
    shortDescription: "Anti-apartheid revolutionary, first Black president of South Africa",
    imageUrl: null,
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
];

const mockTopCountries: TargetWithStats[] = [
  {
    id: "c5",
    slug: "india",
    name: "India",
    targetType: "country",
    shortDescription: "Ancient civilization, world's largest democracy",
    imageUrl: null,
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
  {
    id: "c4",
    slug: "japan",
    name: "Japan",
    targetType: "country",
    shortDescription: "Island nation, technological leader",
    imageUrl: null,
    wikipediaUrl: "https://en.wikipedia.org/wiki/Japan",
    avgAccomplishments: 7.5,
    avgOffenses: 4.8,
    avgTotal: 2.7,
    masterTotal: 2.5,
    authTotal: 3.0,
    totalVotes: 1350,
    registeredVotes: 510,
    authenticatedVotes: 220,
  },
  {
    id: "c1",
    slug: "united-states",
    name: "United States",
    targetType: "country",
    shortDescription: "Federal republic, global superpower",
    imageUrl: null,
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
];

const mockTopIdeas: TargetWithStats[] = [
  {
    id: "i4",
    slug: "human-rights",
    name: "Human Rights",
    targetType: "idea",
    shortDescription: "Universal rights and freedoms to which all humans are entitled",
    imageUrl: null,
    wikipediaUrl: "https://en.wikipedia.org/wiki/Human_rights",
    avgAccomplishments: 9.0,
    avgOffenses: 1.5,
    avgTotal: 7.5,
    masterTotal: 8.0,
    authTotal: 7.2,
    totalVotes: 1580,
    registeredVotes: 590,
    authenticatedVotes: 260,
  },
  {
    id: "i6",
    slug: "free-speech",
    name: "Free Speech",
    targetType: "idea",
    shortDescription: "Right to express opinions without government interference",
    imageUrl: null,
    wikipediaUrl: "https://en.wikipedia.org/wiki/Freedom_of_speech",
    avgAccomplishments: 8.8,
    avgOffenses: 2.2,
    avgTotal: 6.6,
    masterTotal: 7.0,
    authTotal: 6.4,
    totalVotes: 1520,
    registeredVotes: 570,
    authenticatedVotes: 250,
  },
  {
    id: "i5",
    slug: "environmentalism",
    name: "Environmentalism",
    targetType: "idea",
    shortDescription: "Movement focused on protecting the natural environment",
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

// Stats
const stats = {
  totalTargets: 523,
  totalVotes: 45892,
  totalUsers: 5234,
  averageScore: 2.8,
};

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${
            trend === "up" ? "bg-accomplishment/10" :
            trend === "down" ? "bg-offense/10" :
            "bg-muted"
          }`}>
            <Icon className={`h-5 w-5 ${
              trend === "up" ? "text-accomplishment" :
              trend === "down" ? "text-offense" :
              "text-muted-foreground"
            }`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TopTargetsList({
  targets,
  type,
}: {
  targets: TargetWithStats[];
  type: "person" | "country" | "idea";
}) {
  return (
    <div className="space-y-3">
      {targets.map((target, index) => (
        <TargetCardHorizontal
          key={target.id}
          id={target.id}
          slug={target.slug}
          name={target.name}
          targetType={target.targetType}
          shortDescription={target.shortDescription}
          imageUrl={target.imageUrl}
          avgTotal={target.avgTotal}
          masterTotal={target.masterTotal}
          totalVotes={target.totalVotes}
          rank={index + 1}
        />
      ))}
    </div>
  );
}

export default function ScoresPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-12 lg:py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">Scores Overview</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Explore the top-rated and most controversial People, Countries, and Ideas
              as rated by the AOT community.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Targets"
              value={stats.totalTargets.toLocaleString()}
              icon={Award}
              description="People, countries, ideas"
            />
            <StatCard
              title="Total Votes"
              value={stats.totalVotes.toLocaleString()}
              icon={Activity}
              trend="up"
            />
            <StatCard
              title="Active Users"
              value={stats.totalUsers.toLocaleString()}
              icon={Users}
              trend="up"
            />
            <StatCard
              title="Average Score"
              value={`+${stats.averageScore}`}
              icon={TrendingUp}
              trend="neutral"
            />
          </div>
        </div>
      </section>

      {/* Rankings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="people" className="gap-1.5">
                  <Users className="h-4 w-4" />
                  People
                </TabsTrigger>
                <TabsTrigger value="countries" className="gap-1.5">
                  <Globe className="h-4 w-4" />
                  Countries
                </TabsTrigger>
                <TabsTrigger value="ideas" className="gap-1.5">
                  <Lightbulb className="h-4 w-4" />
                  Ideas
                </TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-1.5" />
                  Top Rated
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingDown className="h-4 w-4 mr-1.5" />
                  Controversial
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="space-y-8">
              {/* Top People Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Top Rated People
                    </CardTitle>
                    <CardDescription>Highest scoring historical figures</CardDescription>
                  </div>
                  <Link href="/people">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <TopTargetsList targets={mockTopPeople} type="person" />
                </CardContent>
              </Card>

              {/* Top Countries Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-accomplishment" />
                      Top Rated Countries
                    </CardTitle>
                    <CardDescription>Highest scoring nations</CardDescription>
                  </div>
                  <Link href="/countries">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <TopTargetsList targets={mockTopCountries} type="country" />
                </CardContent>
              </Card>

              {/* Top Ideas Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-offense" />
                      Top Rated Ideas
                    </CardTitle>
                    <CardDescription>Highest scoring philosophies and movements</CardDescription>
                  </div>
                  <Link href="/ideas">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <TopTargetsList targets={mockTopIdeas} type="idea" />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="people">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    All People Rankings
                  </CardTitle>
                  <CardDescription>Complete rankings of historical figures</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopTargetsList targets={mockTopPeople} type="person" />
                  <div className="mt-6 text-center">
                    <Link href="/people">
                      <Button variant="outline">
                        View All People
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="countries">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-accomplishment" />
                    All Countries Rankings
                  </CardTitle>
                  <CardDescription>Complete rankings of nations</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopTargetsList targets={mockTopCountries} type="country" />
                  <div className="mt-6 text-center">
                    <Link href="/countries">
                      <Button variant="outline">
                        View All Countries
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ideas">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-offense" />
                    All Ideas Rankings
                  </CardTitle>
                  <CardDescription>Complete rankings of ideologies and movements</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopTargetsList targets={mockTopIdeas} type="idea" />
                  <div className="mt-6 text-center">
                    <Link href="/ideas">
                      <Button variant="outline">
                        View All Ideas
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-12 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Recent Activity</h2>
            <p className="text-muted-foreground">Latest scores from the community</p>
          </div>

          <Card className="max-w-3xl mx-auto">
            <CardContent className="divide-y">
              {[
                { user: "Auth-1234", target: "Albert Einstein", type: "person", a: 9, o: 1, t: 8, time: "2 min ago" },
                { user: "R-5678", target: "Democracy", type: "idea", a: 8, o: 3, t: 5, time: "5 min ago" },
                { user: "Auth-9999", target: "Japan", type: "country", a: 7, o: 4, t: 3, time: "8 min ago" },
                { user: "A-1111", target: "Nelson Mandela", type: "person", a: 10, o: 2, t: 8, time: "12 min ago" },
              ].map((activity, i) => (
                <div key={i} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {activity.user.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>
                        {" scored "}
                        <Link
                          href={`/${activity.type === "person" ? "people" : activity.type === "country" ? "countries" : "ideas"}/${activity.target.toLowerCase().replace(/\s+/g, "-")}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {activity.target}
                        </Link>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                  <ScoreInline accomplishments={activity.a} offenses={activity.o} total={activity.t} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
