"use client";

import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Crown,
  TrendingUp,
  Calendar,
  Settings,
  LogOut,
  UserPlus,
  Loader2,
  ChevronLeft,
  Shield,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GroupMember {
  id: string;
  aotId: string;
  displayName: string | null;
  avatarUrl: string | null;
  userType: string;
  karma?: number;
  role: "admin" | "moderator" | "member";
  joinedAt: string;
}

interface Group {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  memberCount: number;
  totalKarma: number;
  isPublic: boolean;
  createdAt: string;
  creator: {
    id: string;
    aotId: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  pinnedTarget: {
    id: string;
    slug: string;
    name: string;
    targetType: string;
    imageUrl: string | null;
  } | null;
  members: GroupMember[];
  userMembership: {
    role: "admin" | "moderator" | "member";
    joinedAt: string;
  } | null;
}

interface MembersResponse {
  success: boolean;
  data: GroupMember[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

async function fetchGroup(slug: string): Promise<{ success: boolean; data: Group }> {
  const res = await fetch(`/api/groups/${slug}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Group not found");
  }
  return res.json();
}

async function fetchMembers(slug: string, offset = 0): Promise<MembersResponse> {
  const res = await fetch(`/api/groups/${slug}/members?limit=50&offset=${offset}`);
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json();
}

function MemberCard({ member }: { member: GroupMember }) {
  const roleColors = {
    admin: "text-yellow-500",
    moderator: "text-blue-500",
    member: "text-muted-foreground",
  };

  const roleIcons = {
    admin: Crown,
    moderator: Shield,
    member: Users,
  };

  const RoleIcon = roleIcons[member.role];

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <Avatar>
        <AvatarImage src={member.avatarUrl || undefined} />
        <AvatarFallback>
          {(member.displayName || member.aotId).slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">
            {member.displayName || member.aotId}
          </span>
          <RoleIcon className={`h-3 w-3 ${roleColors[member.role]}`} />
        </div>
        <p className="text-xs text-muted-foreground">
          Joined {new Date(member.joinedAt).toLocaleDateString()}
        </p>
      </div>

      {member.karma !== undefined && (
        <Badge variant="secondary" className="text-xs">
          {member.karma} karma
        </Badge>
      )}
    </div>
  );
}

function EditGroupDialog({
  group,
  open,
  onOpenChange,
}: {
  group: Group;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");
  const [isPublic, setIsPublic] = useState(group.isPublic);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/groups/${group.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, isPublic }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update group");
      }

      queryClient.invalidateQueries({ queryKey: ["group", group.slug] });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Group</DialogTitle>
            <DialogDescription>
              Update your group&apos;s information.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-name">Group Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="edit-public">Public Group</Label>
                <p className="text-xs text-muted-foreground">
                  Anyone can join public groups
                </p>
              </div>
              <Switch
                id="edit-public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const {
    data: groupData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["group", slug],
    queryFn: () => fetchGroup(slug),
  });

  const { data: membersData } = useQuery({
    queryKey: ["group-members", slug],
    queryFn: () => fetchMembers(slug),
    enabled: !!groupData,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/groups/${slug}/members`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join group");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", slug] });
      queryClient.invalidateQueries({ queryKey: ["group-members", slug] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/groups/${slug}/members`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to leave group");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", slug] });
      queryClient.invalidateQueries({ queryKey: ["group-members", slug] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !groupData?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="glass-card max-w-md w-full mx-4">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Group Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "This group doesn't exist or has been removed."}
            </p>
            <Button asChild>
              <Link href="/groups">Browse Groups</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const group = groupData.data;
  const isAdmin = group.userMembership?.role === "admin";
  const isMember = !!group.userMembership;
  const members = membersData?.data || group.members;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" size="sm" asChild>
            <Link href="/groups">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Groups
            </Link>
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar className="h-24 w-24 rounded-xl">
                  <AvatarImage src={group.imageUrl || undefined} />
                  <AvatarFallback className="rounded-xl bg-primary/20 text-primary text-2xl">
                    {group.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{group.name}</h1>
                    <Badge variant={group.isPublic ? "secondary" : "outline"}>
                      {group.isPublic ? (
                        <>
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </>
                      )}
                    </Badge>
                  </div>

                  {group.description && (
                    <p className="text-muted-foreground mb-4">
                      {group.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{group.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>{group.totalKarma} karma</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Created {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Crown className="h-4 w-4" />
                      <span>
                        By {group.creator.displayName || group.creator.aotId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  {session?.user ? (
                    isMember ? (
                      <>
                        <Badge className="justify-center">
                          {group.userMembership?.role === "admin"
                            ? "Admin"
                            : group.userMembership?.role === "moderator"
                            ? "Moderator"
                            : "Member"}
                        </Badge>

                        {isAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditDialogOpen(true)}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </Button>
                        )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <LogOut className="h-4 w-4 mr-2" />
                              Leave Group
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Leave Group?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to leave {group.name}?
                                {isAdmin &&
                                  " As an admin, you should transfer ownership before leaving."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => leaveMutation.mutate()}
                                disabled={leaveMutation.isPending}
                              >
                                {leaveMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Leave"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {leaveMutation.isError && (
                          <p className="text-xs text-destructive">
                            {leaveMutation.error instanceof Error
                              ? leaveMutation.error.message
                              : "Failed to leave"}
                          </p>
                        )}
                      </>
                    ) : (
                      <Button
                        onClick={() => joinMutation.mutate()}
                        disabled={joinMutation.isPending || !group.isPublic}
                      >
                        {joinMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        {group.isPublic ? "Join Group" : "Private Group"}
                      </Button>
                    )
                  ) : (
                    <Button asChild>
                      <Link href="/login">Sign in to Join</Link>
                    </Button>
                  )}

                  {joinMutation.isError && (
                    <p className="text-xs text-destructive">
                      {joinMutation.error instanceof Error
                        ? joinMutation.error.message
                        : "Failed to join"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="members">
            <TabsList className="mb-6">
              <TabsTrigger value="members">
                Members ({group.memberCount})
              </TabsTrigger>
              <TabsTrigger value="scores">Group Scores</TabsTrigger>
              <TabsTrigger value="discussions">Discussions</TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {members.map((member) => (
                      <MemberCard key={member.id} member={member} />
                    ))}
                  </div>

                  {membersData?.pagination?.hasMore && (
                    <div className="mt-4 text-center">
                      <Button variant="outline" size="sm">
                        Load More Members
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scores">
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    Group Scoring Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    Score targets as a group and see aggregated group scores.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussions">
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    Discussions Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    Start conversations with other group members.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Pinned Target */}
        {group.pinnedTarget && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Pinned Contender</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/${group.pinnedTarget.targetType.toLowerCase()}/${group.pinnedTarget.slug}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={group.pinnedTarget.imageUrl || undefined} />
                    <AvatarFallback>
                      {group.pinnedTarget.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{group.pinnedTarget.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {group.pinnedTarget.targetType.toLowerCase()}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Edit Dialog */}
      {isAdmin && (
        <EditGroupDialog
          group={group}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  );
}
