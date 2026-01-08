"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  initialContent?: string;
  isReply?: boolean;
  charLimit?: number;
  isEditing?: boolean;
}

export function CommentForm({
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  initialContent = "",
  isReply = false,
  charLimit,
  isEditing = false,
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const charCount = content.length;
  const isOverLimit = charLimit ? charCount > charLimit : false;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content);
      if (!isEditing) {
        setContent("");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={isReply ? { opacity: 0, height: 0 } : false}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "space-y-2",
        isReply && "pl-4 border-l-2 border-border/50"
      )}
    >
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "min-h-[80px] resize-none pr-20 transition-all duration-200",
            "bg-card/50 backdrop-blur-sm border-border/50",
            isFocused && "ring-2 ring-primary/20 border-primary/30",
            isOverLimit && "border-destructive focus:ring-destructive/20"
          )}
          disabled={isSubmitting}
        />
        <div
          className={cn(
            "absolute bottom-2 right-2 text-xs transition-colors",
            isOverLimit ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {charLimit && (
            <span>
              {charCount}/{charLimit}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {(content.trim() || isEditing) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-end gap-2"
          >
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={!canSubmit}
              className="min-w-[80px]"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-1" />
                  {isEditing ? "Update" : isReply ? "Reply" : "Post"}
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
