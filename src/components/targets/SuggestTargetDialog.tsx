"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface SuggestTargetDialogProps {
  targetType: "person" | "country" | "idea";
  trigger?: React.ReactNode;
}

const categoryOptions = {
  person: [
    { value: "politician", label: "Politician" },
    { value: "celebrity", label: "Celebrity" },
    { value: "athlete", label: "Athlete" },
    { value: "business", label: "Business Leader" },
    { value: "scientist", label: "Scientist" },
    { value: "artist", label: "Artist" },
    { value: "other", label: "Other" },
  ],
  country: [
    { value: "asia", label: "Asia" },
    { value: "europe", label: "Europe" },
    { value: "north-america", label: "North America" },
    { value: "south-america", label: "South America" },
    { value: "africa", label: "Africa" },
    { value: "oceania", label: "Oceania" },
  ],
  idea: [
    { value: "technology", label: "Technology" },
    { value: "politics", label: "Politics" },
    { value: "economics", label: "Economics" },
    { value: "social", label: "Social" },
    { value: "environment", label: "Environment" },
    { value: "philosophy", label: "Philosophy" },
    { value: "other", label: "Other" },
  ],
};

const typeLabels = {
  person: "Person",
  country: "Country",
  idea: "Idea",
};

export function SuggestTargetDialog({ targetType, trigger }: SuggestTargetDialogProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [wikipediaUrl, setWikipediaUrl] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("Please sign in to suggest a target");
      router.push("/login");
      return;
    }

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          name: name.trim(),
          description: description.trim(),
          wikipediaUrl: wikipediaUrl.trim() || null,
          category: category || null,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to submit suggestion");
      }

      toast.success("Suggestion submitted! It will be reviewed by our team.");
      setOpen(false);
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setWikipediaUrl("");
    setCategory("");
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Plus className="h-4 w-4 mr-2" />
      Suggest {typeLabels[targetType]}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Suggest a {typeLabels[targetType]}</DialogTitle>
          <DialogDescription>
            Submit a suggestion for a new {targetType} to be added to AOT.
            Our team will review it before publishing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder={`Enter ${targetType} name`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder={`Brief description of this ${targetType}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions[targetType].map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wikipediaUrl">Wikipedia URL (optional)</Label>
            <Input
              id="wikipediaUrl"
              type="url"
              placeholder="https://en.wikipedia.org/wiki/..."
              value={wikipediaUrl}
              onChange={(e) => setWikipediaUrl(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Suggestion"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
