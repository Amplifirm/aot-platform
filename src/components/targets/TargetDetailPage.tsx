"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  Share2,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  TrendingUp,
  Users,
  Shield,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreDisplay, ScoreBadge, ScoreInline } from "@/components/scoring/ScoreDisplay";
import { ScoreInput } from "@/components/scoring/ScoreInput";
import { ScoreHistoryChart } from "@/components/targets/ScoreHistoryChart";
import { CommentThread } from "@/components/comments";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { TargetType, VoteWithUser } from "@/types";

interface TargetDetailPageProps {
  slug: string;
  type: TargetType;
  backLink: string;
  backLabel: string;
}

interface TargetData {
  id: string;
  slug: string;
  name: string;
  targetType: TargetType;
  shortDescription: string | null;
  longDescription: string | null;
  wikipediaUrl: string | null;
  imageUrl: string | null;
  metadata: {
    birthDate?: string;
    deathDate?: string;
    nationality?: string;
    occupation?: string[];
    region?: string;
    ideologyType?: string;
    aliases?: string[];
  } | null;
  avgAccomplishments: string;
  avgOffenses: string;
  avgTotal: string;
  masterAccomplishments: string | null;
  masterOffenses: string | null;
  masterTotal: string | null;
  authAccomplishments: string | null;
  authOffenses: string | null;
  authTotal: string | null;
  totalVotes: number;
  anonymousVotes: number;
  registeredVotes: number;
  authenticatedVotes: number;
  isPinned: boolean;
  createdAt: string;
}

interface VoteData {
  id: string;
  accomplishments: number;
  offenses: number;
  total: number;
  explanation: string | null;
  thumbsUp: number;
  thumbsDown: number;
  netKarma: number;
  isPinned: boolean;
  createdAt: string;
  user: {
    id: string;
    aotId: string;
    displayName: string | null;
    avatarUrl: string | null;
    userType: "anonymous" | "registered" | "authenticated";
  };
}

function getUserTypeBadge(userType: string) {
  switch (userType) {
    case "authenticated":
      return <Badge variant="default" className="text-xs">Verified</Badge>;
    case "registered":
      return <Badge variant="secondary" className="text-xs">Registered</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">Anonymous</Badge>;
  }
}

async function fetchTarget(slug: string) {
  const res = await fetch(`/api/targets/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch target");
  const json = await res.json();
  return json.data;
}

async function fetchTargetVotes(slug: string, sortBy = "recent", limit = 20, offset = 0) {
  const res = await fetch(`/api/targets/${slug}/votes?sortBy=${sortBy}&limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("Failed to fetch votes");
  const json = await res.json();
  return json.data;
}

export function TargetDetailPage({ slug, type, backLink, backLabel }: TargetDetailPageProps) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [voteSortBy, setVoteSortBy] = useState<"recent" | "highest" | "karma">("recent");

  // Fetch target data
  const { data: targetData, isLoading: targetLoading, error: targetError } = useQuery({
    queryKey: ["target", slug],
    queryFn: () => fetchTarget(slug),
  });

  // Fetch votes
  const { data: votesData, isLoading: votesLoading } = useQuery({
    queryKey: ["targetVotes", slug, voteSortBy],
    queryFn: () => fetchTargetVotes(slug, voteSortBy),
    enabled: !!targetData,
  });

  const target: TargetData | undefined = targetData?.target;
  const history = targetData?.history || [];
  const events = targetData?.events || [];
  const votes: VoteData[] = votesData?.votes || [];
  const userVote = votesData?.userVote;

  // Create vote mutation
  const createVoteMutation = useMutation({
    mutationFn: async (data: { accomplishments: number; offenses: number; explanation: string }) => {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: target?.id, ...data }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to submit vote");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["target", slug] });
      queryClient.invalidateQueries({ queryKey: ["targetVotes", slug] });
      toast.success("Score submitted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update vote mutation
  const updateVoteMutation = useMutation({
    mutationFn: async (data: { voteId: string; accomplishments: number; offenses: number; explanation: string }) => {
      const res = await fetch(`/api/votes/${data.voteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accomplishments: data.accomplishments,
          offenses: data.offenses,
          explanation: data.explanation,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update vote");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["target", slug] });
      queryClient.invalidateQueries({ queryKey: ["targetVotes", slug] });
      toast.success("Score updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Karma mutation
  const karmaMutation = useMutation({
    mutationFn: async ({ voteId, value }: { voteId: string; value: 1 | -1 }) => {
      const res = await fetch(`/api/votes/${voteId}/karma`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to vote");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["targetVotes", slug] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleScoreSubmit = async (data: { accomplishments: number; offenses: number; explanation: string }) => {
    if (userVote) {
      await updateVoteMutation.mutateAsync({ voteId: userVote.id, ...data });
    } else {
      await createVoteMutation.mutateAsync(data);
    }
  };

  const handleKarmaVote = (voteId: string, value: 1 | -1) => {
    if (!session?.user) {
      toast.error("Please login to vote");
      return;
    }
    karmaMutation.mutate({ voteId, value });
  };

  if (targetLoading) {
    return <TargetDetailSkeleton />;
  }

  if (targetError || !target) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Target not found</h2>
          <p className="text-muted-foreground mb-4">The {type} you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href={backLink}>Go back to {backLabel}</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const avgA = parseFloat(target.avgAccomplishments);
  const avgO = parseFloat(target.avgOffenses);
  const avgT = parseFloat(target.avgTotal);
  const masterT = target.masterTotal ? parseFloat(target.masterTotal) : null;
  const authT = target.authTotal ? parseFloat(target.authTotal) : null;

  return (
    <div className="min-h-screen pb-16">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={backLink} className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{target.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Target Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="overflow-hidden">
                <div className="relative h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_var(--tw-gradient-stops))] from-accomplishment/10 to-transparent" />
                </div>
                <CardContent className="relative -mt-16 pb-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                      <AvatarImage src={target.imageUrl || undefined} alt={target.name} />
                      <AvatarFallback className="text-3xl">
                        {target.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-3 pt-2 sm:pt-8">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="capitalize">{type}</Badge>
                        {target.isPinned && (
                          <Badge variant="outline" className="border-primary text-primary">Pinned</Badge>
                        )}
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold">{target.name}</h1>
                      {target.shortDescription && (
                        <p className="text-muted-foreground">{target.shortDescription}</p>
                      )}
                      {target.metadata && (
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {target.metadata.birthDate && target.metadata.deathDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {target.metadata.birthDate} - {target.metadata.deathDate}
                            </span>
                          )}
                          {target.metadata.nationality && (
                            <span>{target.metadata.nationality}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 self-start sm:self-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsBookmarked(!isBookmarked)}
                      >
                        <Bookmark
                          className={cn(
                            "h-5 w-5",
                            isBookmarked && "fill-current text-primary"
                          )}
                        />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-5 w-5" />
                      </Button>
                      {target.wikipediaUrl && (
                        <Button variant="outline" asChild>
                          <a href={target.wikipediaUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Wikipedia
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Master Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-muted/50 to-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Community Score
                  </CardTitle>
                  <CardDescription>
                    Aggregate score from {target.totalVotes.toLocaleString()} votes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScoreDisplay
                    accomplishments={avgA}
                    offenses={avgO}
                    total={avgT}
                    size="xl"
                    showLabels
                    decimal
                  />

                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">All Users</p>
                      <ScoreBadge total={avgT} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {target.totalVotes} votes
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Master Score</p>
                      <ScoreBadge total={masterT || 0} />
                      <p className="text-xs text-muted-foreground mt-1">
                        weighted
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Verified Only</p>
                      <ScoreBadge total={authT || 0} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {target.authenticatedVotes} votes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Full Description */}
            {target.longDescription && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {target.longDescription}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Score History Graph */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Score History
                </CardTitle>
                <CardDescription>
                  Track how scores have changed over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <ScoreHistoryChart data={history} events={events} />
                ) : (
                  <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Not enough data for history chart</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Scores */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Individual Scores
                    </CardTitle>
                    <CardDescription>
                      Scores submitted by community members
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs
                  defaultValue="all"
                  className="w-full"
                  onValueChange={(v) => {
                    if (v === "recent") setVoteSortBy("recent");
                    else if (v === "top") setVoteSortBy("karma");
                  }}
                >
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="all">All ({votesData?.total || 0})</TabsTrigger>
                    <TabsTrigger value="top">Top Rated</TabsTrigger>
                    <TabsTrigger value="recent">Recent</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-4 space-y-4">
                    {votesLoading ? (
                      <VotesSkeleton />
                    ) : votes.length > 0 ? (
                      votes.map((vote) => (
                        <VoteCard
                          key={vote.id}
                          vote={vote}
                          onThumbsUp={() => handleKarmaVote(vote.id, 1)}
                          onThumbsDown={() => handleKarmaVote(vote.id, -1)}
                          isLoggedIn={!!session?.user}
                        />
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No scores yet. Be the first to score!
                      </p>
                    )}
                  </TabsContent>
                  <TabsContent value="top" className="mt-4 space-y-4">
                    {votes.map((vote) => (
                      <VoteCard
                        key={vote.id}
                        vote={vote}
                        onThumbsUp={() => handleKarmaVote(vote.id, 1)}
                        onThumbsDown={() => handleKarmaVote(vote.id, -1)}
                        isLoggedIn={!!session?.user}
                      />
                    ))}
                  </TabsContent>
                  <TabsContent value="recent" className="mt-4 space-y-4">
                    {votes.map((vote) => (
                      <VoteCard
                        key={vote.id}
                        vote={vote}
                        onThumbsUp={() => handleKarmaVote(vote.id, 1)}
                        onThumbsDown={() => handleKarmaVote(vote.id, -1)}
                        isLoggedIn={!!session?.user}
                      />
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="sticky top-24"
            >
              <ScoreInput
                targetId={target.id}
                targetName={target.name}
                existingVote={userVote ? {
                  accomplishments: userVote.accomplishments,
                  offenses: userVote.offenses,
                  explanation: userVote.explanation,
                } : undefined}
                userTier={session?.user?.subscriptionTier || "T1"}
                onSubmit={handleScoreSubmit}
                disabled={status === "loading" || !session?.user}
              />

              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Votes</span>
                    <span className="font-medium">{target.totalVotes.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Registered Votes</span>
                    <span className="font-medium">{target.registeredVotes}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Verified Votes</span>
                    <span className="font-medium">{target.authenticatedVotes}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg A Score</span>
                    <span className="font-medium text-accomplishment">{avgA.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg O Score</span>
                    <span className="font-medium text-offense">{avgO.toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Vote Card Component
interface VoteCardProps {
  vote: VoteData;
  onThumbsUp: () => void;
  onThumbsDown: () => void;
  isLoggedIn: boolean;
}

function VoteCard({ vote, onThumbsUp, onThumbsDown, isLoggedIn }: VoteCardProps) {
  const [showComments, setShowComments] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border overflow-hidden",
        vote.isPinned && "border-primary/50 bg-primary/5"
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={vote.user.avatarUrl || undefined} />
              <AvatarFallback>
                {(vote.user.displayName || vote.user.aotId).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {vote.user.displayName || vote.user.aotId}
                </span>
                {getUserTypeBadge(vote.user.userType)}
                {vote.isPinned && (
                  <Badge variant="outline" className="text-xs border-primary text-primary">
                    Pinned
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(vote.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <ScoreInline
            accomplishments={vote.accomplishments}
            offenses={vote.offenses}
            total={vote.total}
          />
        </div>
        {vote.explanation && (
          <p className="mt-3 text-sm text-muted-foreground pl-13">
            {vote.explanation}
          </p>
        )}
        <div className="flex items-center gap-4 mt-3 pl-13">
          <button
            onClick={onThumbsUp}
            disabled={!isLoggedIn}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accomplishment transition-colors disabled:opacity-50"
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{vote.thumbsUp}</span>
          </button>
          <button
            onClick={onThumbsDown}
            disabled={!isLoggedIn}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-offense transition-colors disabled:opacity-50"
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{vote.thumbsDown}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className={cn(
              "flex items-center gap-1 text-sm transition-colors",
              showComments
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span>{showComments ? "Hide" : "Discuss"}</span>
          </button>
        </div>
      </div>

      {/* Comment Thread */}
      {showComments && (
        <div className="border-t bg-muted/30">
          <CommentThread
            voteId={vote.id}
            title="Discussion"
            collapsed={false}
          />
        </div>
      )}
    </motion.div>
  );
}

// Loading skeletons
function TargetDetailSkeleton() {
  return (
    <div className="min-h-screen pb-16">
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-3">
          <Skeleton className="h-5 w-48" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden">
              <div className="h-32 bg-muted" />
              <CardContent className="relative -mt-16 pb-6">
                <div className="flex gap-6">
                  <Skeleton className="h-32 w-32 rounded-full" />
                  <div className="flex-1 space-y-3 pt-8">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-8">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="py-8">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function VotesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-lg border">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-4 w-full mt-3" />
        </div>
      ))}
    </div>
  );
}
