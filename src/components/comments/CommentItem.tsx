"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CommentForm } from "./CommentForm";
import { cn } from "@/lib/utils";

interface CommentUser {
  id: string;
  aotId: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  userType: string;
  karma: number;
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
  user: CommentUser;
  replies?: Comment[];
  replyCount?: number;
  voteId?: string | null;
  targetId?: string | null;
  parentId?: string | null;
}

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  voteId?: string;
  targetId?: string;
  charLimit?: number;
  depth?: number;
  maxDepth?: number;
  onReplyAdded?: () => void;
}

export function CommentItem({
  comment,
  currentUserId,
  voteId,
  targetId,
  charLimit,
  depth = 0,
  maxDepth = 3,
  onReplyAdded,
}: CommentItemProps) {
  const queryClient = useQueryClient();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < 2);

  const isOwner = currentUserId === comment.user.id;
  const createdAt =
    typeof comment.createdAt === "string"
      ? new Date(comment.createdAt)
      : comment.createdAt;
  const wasEdited =
    comment.updatedAt &&
    new Date(comment.updatedAt).getTime() - createdAt.getTime() > 1000;

  // Fetch user's karma vote
  const { data: karmaData } = useQuery({
    queryKey: ["comment-karma", comment.id],
    queryFn: async () => {
      const res = await fetch(`/api/comments/${comment.id}/karma`);
      const data = await res.json();
      return data.success ? data.data : null;
    },
    enabled: !!currentUserId,
  });

  // Karma vote mutation
  const karmaMutation = useMutation({
    mutationFn: async (value: 1 | -1) => {
      const res = await fetch(`/api/comments/${comment.id}/karma`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: String(value) }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comment-karma", comment.id] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
    },
    onSuccess: () => {
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          voteId: voteId || comment.voteId,
          targetId: targetId || comment.targetId,
          parentId: comment.id,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: () => {
      setShowReplyForm(false);
      setShowReplies(true);
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      onReplyAdded?.();
    },
  });

  const userKarmaVote = karmaData?.value || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group",
        depth > 0 && "ml-4 pl-4 border-l-2 border-border/30"
      )}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.user.avatarUrl || undefined} />
          <AvatarFallback className="text-xs">
            {comment.user.displayName?.[0] || comment.user.aotId?.[0] || "?"}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {comment.user.displayName || comment.user.aotId || "Anonymous"}
            </span>
            <Badge
              variant={
                comment.user.userType === "authenticated"
                  ? "default"
                  : "secondary"
              }
              className="text-[10px] px-1.5 py-0"
            >
              {comment.user.userType}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
            {wasEdited && (
              <span className="text-xs text-muted-foreground italic">
                (edited)
              </span>
            )}
          </div>

          {/* Body */}
          {isEditing ? (
            <CommentForm
              initialContent={comment.content}
              onSubmit={async (content) => {
                await editMutation.mutateAsync(content);
              }}
              onCancel={() => setIsEditing(false)}
              charLimit={charLimit}
              isEditing
            />
          ) : (
            <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-1 -ml-2">
              {/* Karma buttons */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2 gap-1",
                  userKarmaVote === 1 && "text-accomplishment"
                )}
                onClick={() => karmaMutation.mutate(1)}
                disabled={!currentUserId || karmaMutation.isPending}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span className="text-xs">{comment.thumbsUp}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 px-2 gap-1",
                  userKarmaVote === -1 && "text-offense"
                )}
                onClick={() => karmaMutation.mutate(-1)}
                disabled={!currentUserId || karmaMutation.isPending}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                <span className="text-xs">{comment.thumbsDown}</span>
              </Button>

              {/* Reply button */}
              {currentUserId && depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 gap-1"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="text-xs">Reply</span>
                </Button>
              )}

              {/* More menu */}
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Reply form */}
          <AnimatePresence>
            {showReplyForm && (
              <CommentForm
                placeholder="Write a reply..."
                onSubmit={async (content) => {
                  await replyMutation.mutateAsync(content);
                }}
                onCancel={() => setShowReplyForm(false)}
                charLimit={charLimit}
                isReply
              />
            )}
          </AnimatePresence>

          {/* Replies */}
          {comment.replyCount && comment.replyCount > 0 && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5 mr-1" />
                    Hide replies
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5 mr-1" />
                    Show {comment.replyCount} repl
                    {comment.replyCount === 1 ? "y" : "ies"}
                  </>
                )}
              </Button>

              <AnimatePresence>
                {showReplies && comment.replies && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 mt-2"
                  >
                    {comment.replies.map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        currentUserId={currentUserId}
                        voteId={voteId}
                        targetId={targetId}
                        charLimit={charLimit}
                        depth={depth + 1}
                        maxDepth={maxDepth}
                        onReplyAdded={onReplyAdded}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              comment and all its replies.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
