"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { getTierCharLimit, getEffectiveTier } from "@/lib/utils/permissions";

interface CommentThreadProps {
  voteId?: string;
  targetId?: string;
  title?: string;
  collapsed?: boolean;
}

interface Comment {
  id: string;
  content: string;
  characterCount: number;
  thumbsUp: number;
  thumbsDown: number;
  netKarma: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  user: {
    id: string;
    aotId: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    userType: string;
    karma: number;
  };
  replies?: Comment[];
  replyCount?: number;
  voteId?: string | null;
  targetId?: string | null;
  parentId?: string | null;
}

export function CommentThread({
  voteId,
  targetId,
  title = "Comments",
  collapsed = false,
}: CommentThreadProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isExpanded, setIsExpanded] = useState(!collapsed);
  const [page, setPage] = useState(0);
  const limit = 10;

  const queryKey = ["comments", { voteId, targetId, page }];

  // Fetch comments
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (voteId) params.set("voteId", voteId);
      if (targetId) params.set("targetId", targetId);
      params.set("limit", String(limit));
      params.set("offset", String(page * limit));
      params.set("includeReplies", "true");
      params.set("maxDepth", "3");

      const res = await fetch(`/api/comments?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    enabled: isExpanded && !!(voteId || targetId),
  });

  // Create comment mutation
  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, voteId, targetId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const comments: Comment[] = data?.data || [];
  const pagination = data?.pagination || { total: 0, hasMore: false };

  // Calculate character limit based on user's tier
  const charLimit = session?.user
    ? getTierCharLimit(
        getEffectiveTier(session.user.userType, session.user.subscriptionTier)
      )
    : 140;

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-foreground/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-medium">{title}</span>
          <span className="text-sm text-muted-foreground">
            ({pagination.total})
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border/50">
              {/* New comment form */}
              {session?.user ? (
                <div className="pt-4">
                  <CommentForm
                    placeholder="Share your thoughts..."
                    onSubmit={async (content) => {
                      await createMutation.mutateAsync(content);
                    }}
                    charLimit={charLimit || undefined}
                  />
                </div>
              ) : (
                <div className="pt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    <a href="/login" className="text-primary hover:underline">
                      Sign in
                    </a>{" "}
                    to join the discussion
                  </p>
                </div>
              )}

              {/* Loading state */}
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Error state */}
              {error && (
                <div className="text-center py-8">
                  <p className="text-sm text-destructive">
                    Failed to load comments
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      queryClient.invalidateQueries({ queryKey })
                    }
                    className="mt-2"
                  >
                    Try again
                  </Button>
                </div>
              )}

              {/* Comments list */}
              {!isLoading && !error && comments.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                </div>
              )}

              {!isLoading && !error && comments.length > 0 && (
                <div className="space-y-4 pt-4">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      currentUserId={session?.user?.id}
                      voteId={voteId}
                      targetId={targetId}
                      charLimit={charLimit || undefined}
                      onReplyAdded={() =>
                        queryClient.invalidateQueries({ queryKey })
                      }
                    />
                  ))}

                  {/* Load more */}
                  {pagination.hasMore && (
                    <div className="text-center pt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        className="text-muted-foreground"
                      >
                        Load more comments
                      </Button>
                    </div>
                  )}

                  {/* Pagination info */}
                  {pagination.total > limit && (
                    <div className="text-center pt-2">
                      <p className="text-xs text-muted-foreground">
                        Showing {Math.min((page + 1) * limit, pagination.total)}{" "}
                        of {pagination.total} comments
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
