"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  User,
  Award,
  MessageSquare,
  Users,
  Calendar,
  Settings,
  Trophy,
  TrendingUp,
  ExternalLink,
  Shield,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreInline, ScoreBadge } from "@/components/scoring/ScoreDisplay";
import type { TargetType } from "@/types";

interface UserVote {
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
  target: {
    id: string;
    slug: string;
    name: string;
    targetType: TargetType;
    imageUrl: string | null;
  } | null;
}

interface UserComment {
  id: string;
  content: string;
  thumbsUp: number;
  thumbsDown: number;
  netKarma: number;
  createdAt: string;
  voteId: string | null;
  targetId: string | null;
}

interface UserGroup {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  memberCount: number;
  role: string;
  joinedAt: string;
}

interface UserProfile {
  id: string;
  aotId: string;
  displayName: string | null;
  name: string | null;
  avatarUrl: string | null;
  image: string | null;
  bio: string | null;
  userType: "anonymous" | "registered" | "authenticated";
  subscriptionTier: "T1" | "T2" | "T3" | "T4" | "T5";
  karma: number;
  totalVotes: number;
  totalComments: number;
  createdAt: string;
  role: "user" | "moderator" | "admin";
}

interface UserStats {
  avgAccomplishments: number | null;
  avgOffenses: number | null;
  avgTotal: number | null;
  uniqueTargets: number;
}

function getTierBadge(tier: string) {
  const colors: Record<string, string> = {
    T1: "bg-muted text-muted-foreground",
    T2: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    T3: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    T4: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    T5: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white",
  };
  return colors[tier] || colors.T1;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();

  // Fetch user data
  const { data, isLoading, error } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      const res = await fetch(
        `/api/users/${session?.user?.id}?includeVotes=true&includeComments=true&includeGroups=true`
      );
      if (!res.ok) throw new Error("Failed to fetch profile");
      const json = await res.json();
      return json.data;
    },
    enabled: !!session?.user?.id,
  });

  if (status === "loading" || isLoading) {
    return <ProfileSkeleton />;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Error loading profile</h2>
          <p className="text-muted-foreground mb-4">Please try again later.</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const user: UserProfile = data.user;
  const votes: UserVote[] = data.votes || [];
  const comments: UserComment[] = data.comments || [];
  const groups: UserGroup[] = data.groups || [];
  const stats: UserStats = data.stats || {};

  const avatarSrc = user.avatarUrl || user.image;
  const displayName = user.displayName || user.name || user.aotId;

  return (
    <div className="min-h-screen pb-16">
      {/* Profile Header */}
      <div className="relative">
        <div className="absolute inset-0 h-48 bg-gradient-to-br from-primary/20 via-accomplishment/10 to-offense/10" />
        <div className="container mx-auto px-4 pt-8 pb-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                    <AvatarImage src={avatarSrc || undefined} alt={displayName} />
                    <AvatarFallback className="text-2xl">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold">{displayName}</h1>
                      {user.role === "admin" && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          Admin
                        </Badge>
                      )}
                      {user.role === "moderator" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Mod
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <Badge
                        variant={user.userType === "authenticated" ? "default" : "secondary"}
                      >
                        {user.userType}
                      </Badge>
                      <Badge variant="outline" className={getTierBadge(user.subscriptionTier)}>
                        Tier {user.subscriptionTier.slice(1)}
                      </Badge>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    {user.bio && (
                      <p className="text-muted-foreground max-w-2xl">{user.bio}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-6 pt-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        <span className="font-semibold">{user.karma}</span>
                        <span className="text-muted-foreground text-sm">Karma</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="font-semibold">{user.totalVotes}</span>
                        <span className="text-muted-foreground text-sm">Scores</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-accomplishment" />
                        <span className="font-semibold">{user.totalComments}</span>
                        <span className="text-muted-foreground text-sm">Comments</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-offense" />
                        <span className="font-semibold">{groups.length}</span>
                        <span className="text-muted-foreground text-sm">Groups</span>
                      </div>
                    </div>
                  </div>

                  <Button asChild variant="outline">
                    <Link href="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="scores" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="scores">Scores ({votes.length})</TabsTrigger>
                <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
                <TabsTrigger value="groups">Groups ({groups.length})</TabsTrigger>
              </TabsList>

              {/* Scores Tab */}
              <TabsContent value="scores" className="mt-6 space-y-4">
                {votes.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No scores yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start scoring historical figures, countries, and ideas!
                    </p>
                    <Button asChild>
                      <Link href="/people">Browse Targets</Link>
                    </Button>
                  </Card>
                ) : (
                  votes.map((vote) => (
                    <motion.div
                      key={vote.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {vote.target && (
                              <Link href={`/${vote.target.targetType}s/${vote.target.slug}`}>
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={vote.target.imageUrl || undefined} />
                                  <AvatarFallback>
                                    {vote.target.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                {vote.target && (
                                  <Link
                                    href={`/${vote.target.targetType}s/${vote.target.slug}`}
                                    className="font-medium hover:text-primary transition-colors"
                                  >
                                    {vote.target.name}
                                  </Link>
                                )}
                                <ScoreInline
                                  accomplishments={vote.accomplishments}
                                  offenses={vote.offenses}
                                  total={vote.total}
                                />
                              </div>
                              {vote.target && (
                                <Badge variant="outline" className="text-xs mt-1 capitalize">
                                  {vote.target.targetType}
                                </Badge>
                              )}
                              {vote.explanation && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {vote.explanation}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>{formatDistanceToNow(new Date(vote.createdAt), { addSuffix: true })}</span>
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {vote.netKarma} karma
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments" className="mt-6 space-y-4">
                {comments.length === 0 ? (
                  <Card className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No comments yet</h3>
                    <p className="text-muted-foreground">
                      Join discussions on scores to share your thoughts!
                    </p>
                  </Card>
                ) : (
                  comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm line-clamp-3">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {comment.netKarma} karma
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </TabsContent>

              {/* Groups Tab */}
              <TabsContent value="groups" className="mt-6 space-y-4">
                {groups.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-2">No groups yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Join groups to collaborate with others!
                    </p>
                    <Button asChild>
                      <Link href="/groups">Browse Groups</Link>
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {groups.map((group) => (
                      <motion.div
                        key={group.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Link href={`/groups/${group.slug}`}>
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={group.imageUrl || undefined} />
                                  <AvatarFallback>
                                    {group.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium truncate">{group.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {group.memberCount} members
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {group.role}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Scoring Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg A Score</span>
                  <span className="font-medium text-accomplishment">
                    {stats.avgAccomplishments?.toFixed(1) || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg O Score</span>
                  <span className="font-medium text-offense">
                    {stats.avgOffenses?.toFixed(1) || "-"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg Total</span>
                  <ScoreBadge total={stats.avgTotal || 0} />
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Unique Targets</span>
                  <span className="font-medium">{stats.uniqueTargets || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* AOT ID Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your AOT ID
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded-lg font-mono text-center text-lg">
                  {user.aotId}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  This is your unique identifier on AOT
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen pb-16">
      <div className="relative">
        <div className="absolute inset-0 h-48 bg-gradient-to-br from-primary/20 via-accomplishment/10 to-offense/10" />
        <div className="container mx-auto px-4 pt-8 pb-6 relative">
          <Card className="overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
