"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  UsersRound,
  Search,
  Plus,
  ArrowUpDown,
  Crown,
  TrendingUp,
  Clock,
  Loader2,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getEffectiveTier, getTierPermissions } from "@/lib/utils/permissions";

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
}

interface GroupsResponse {
  success: boolean;
  data: Group[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

async function fetchGroups(
  search: string,
  sortBy: string,
  offset: number
): Promise<GroupsResponse> {
  const params = new URLSearchParams({
    limit: "20",
    offset: offset.toString(),
    sortBy,
  });
  if (search) params.set("search", search);

  const res = await fetch(`/api/groups?${params}`);
  if (!res.ok) throw new Error("Failed to fetch groups");
  return res.json();
}

function GroupCard({ group }: { group: Group }) {
  return (
    <Link href={`/groups/${group.slug}`}>
      <Card className="card-elevated hover:shadow-md transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 rounded-lg">
              <AvatarImage src={group.imageUrl || undefined} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                {group.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {group.name}
                </h3>
                {!group.isPublic && (
                  <Badge variant="secondary" className="text-xs">
                    Private
                  </Badge>
                )}
              </div>

              {group.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {group.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{group.memberCount} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{group.totalKarma} karma</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Crown className="h-3 w-3" />
                <span>{group.creator.displayName || group.creator.aotId}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, isPublic }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create group");
      }

      window.location.href = `/groups/${data.data.slug}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a New Group</DialogTitle>
            <DialogDescription>
              Create a community group to discuss and score targets together.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
                required
                minLength={3}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this group about?"
                maxLength={500}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public">Public Group</Label>
                <p className="text-xs text-muted-foreground">
                  Anyone can join public groups
                </p>
              </div>
              <Switch
                id="public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function GroupsPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"members" | "recent" | "karma">(
    "members"
  );
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["groups", search, sortBy, offset],
    queryFn: () => fetchGroups(search, sortBy, offset),
  });

  const canCreateGroups = session?.user
    ? getTierPermissions(
        getEffectiveTier(
          session.user.userType as "anonymous" | "registered" | "authenticated",
          (session.user.subscriptionTier as "T1" | "T2" | "T3" | "T4" | "T5") || "T1"
        )
      ).canCreateGroups
    : false;

  const handleSearch = (value: string) => {
    setSearch(value);
    setOffset(0);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <UsersRound className="h-5 w-5 text-purple-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Groups</h1>
            <p className="text-sm text-muted-foreground">Join scoring communities</p>
          </div>
        </div>
        {session?.user && canCreateGroups && <CreateGroupDialog />}
      </div>

      {/* Search and Filters */}
      <Card className="card-elevated mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 bg-muted/50 border-0"
              />
            </div>

            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as typeof sortBy)}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="members">Most Members</SelectItem>
                <SelectItem value="karma">Highest Karma</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Groups List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data?.data.length === 0 ? (
        <Card className="card-elevated">
          <CardContent className="py-12 text-center">
            <UsersRound className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No groups found</h3>
            <p className="text-muted-foreground mb-4">
              {search
                ? "Try a different search term"
                : "Be the first to create a group!"}
            </p>
            {session?.user && canCreateGroups && !search && (
              <CreateGroupDialog />
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {data?.data.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>

          {/* Pagination */}
          {data?.pagination && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                disabled={offset === 0 || isFetching}
                onClick={() => setOffset(Math.max(0, offset - 20))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!data.pagination.hasMore || isFetching}
                onClick={() => setOffset(offset + 20)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Info Card for non-T2+ users */}
      {session?.user && !canCreateGroups && (
        <Card className="card-elevated mt-8">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-1">Want to create a group?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Upgrade to T2 or above to create and manage your own groups.
                </p>
                <Button asChild size="sm">
                  <Link href="/pricing">View Plans</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
