"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ScoreDisplay } from "./ScoreDisplay";
import { cn } from "@/lib/utils";
import type { SubscriptionTier } from "@/types";

interface ScoreInputProps {
  targetId: string;
  targetName: string;
  existingVote?: {
    accomplishments: number;
    offenses: number;
    explanation: string | null;
  };
  userTier: SubscriptionTier;
  onSubmit: (data: {
    accomplishments: number;
    offenses: number;
    explanation: string;
  }) => Promise<void>;
  disabled?: boolean;
}

const TIER_LIMITS: Record<SubscriptionTier, number | null> = {
  T1: 140,
  T2: 140,
  T3: 500,
  T4: 50000,
  T5: null,
};

export function ScoreInput({
  targetId,
  targetName,
  existingVote,
  userTier,
  onSubmit,
  disabled = false,
}: ScoreInputProps) {
  const [accomplishments, setAccomplishments] = useState(
    existingVote?.accomplishments ?? 5
  );
  const [offenses, setOffenses] = useState(existingVote?.offenses ?? 5);
  const [explanation, setExplanation] = useState(
    existingVote?.explanation ?? ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = accomplishments - offenses;
  const charLimit = TIER_LIMITS[userTier];
  const isOverLimit = charLimit !== null && explanation.length > charLimit;
  const isEditing = !!existingVote;

  const handleSubmit = useCallback(async () => {
    if (isOverLimit || disabled) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        accomplishments,
        offenses,
        explanation,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit score");
    } finally {
      setIsSubmitting(false);
    }
  }, [accomplishments, offenses, explanation, isOverLimit, disabled, onSubmit]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isEditing ? "Update Your Score" : "Cast Your Score"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Score {targetName} based on their Accomplishments and Offenses
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Accomplishments Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-accomplishment font-medium">
              Accomplishments (A)
            </Label>
            <span className="text-2xl font-bold text-accomplishment tabular-nums">
              {accomplishments}
            </span>
          </div>
          <Slider
            min={0}
            max={10}
            step={1}
            value={[accomplishments]}
            onValueChange={([v]) => setAccomplishments(v)}
            disabled={disabled}
            className="[&_[role=slider]]:bg-accomplishment"
          />
          <p className="text-xs text-muted-foreground">
            0 = No accomplishments, 10 = Greatest accomplishments ever
          </p>
        </div>

        {/* Offenses Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-offense font-medium">Offenses (O)</Label>
            <span className="text-2xl font-bold text-offense tabular-nums">
              {offenses}
            </span>
          </div>
          <Slider
            min={0}
            max={10}
            step={1}
            value={[offenses]}
            onValueChange={([v]) => setOffenses(v)}
            disabled={disabled}
            className="[&_[role=slider]]:bg-offense"
          />
          <p className="text-xs text-muted-foreground">
            0 = No offenses, 10 = Greatest offenses ever
          </p>
        </div>

        {/* Total Display */}
        <motion.div
          className="py-6 rounded-lg bg-muted/50"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.2 }}
          key={total}
        >
          <ScoreDisplay
            accomplishments={accomplishments}
            offenses={offenses}
            total={total}
            size="lg"
            animated
          />
        </motion.div>

        {/* Explanation */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Explanation</Label>
            {charLimit && (
              <span
                className={cn(
                  "text-xs",
                  isOverLimit ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {explanation.length}/{charLimit}
              </span>
            )}
          </div>
          <Textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain why you gave this score..."
            rows={4}
            disabled={disabled}
            className={cn(isOverLimit && "border-destructive")}
          />
          {isOverLimit && (
            <p className="text-xs text-destructive">
              Upgrade to a higher tier for longer explanations
            </p>
          )}
          {charLimit === null && (
            <p className="text-xs text-muted-foreground">
              Unlimited explanation length
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {error}
          </p>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isOverLimit || isSubmitting || disabled}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : isEditing ? (
            "Update Score"
          ) : (
            "Submit Score"
          )}
        </Button>

        {disabled && (
          <p className="text-xs text-center text-muted-foreground">
            <a href="/login" className="text-primary hover:underline">
              Login
            </a>{" "}
            or{" "}
            <a href="/register" className="text-primary hover:underline">
              register
            </a>{" "}
            to submit a score
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for inline use
interface ScoreInputCompactProps {
  onScore: (a: number, o: number) => void;
  disabled?: boolean;
}

export function ScoreInputCompact({
  onScore,
  disabled,
}: ScoreInputCompactProps) {
  const [a, setA] = useState(5);
  const [o, setO] = useState(5);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Label className="text-xs text-accomplishment">A:</Label>
        <input
          type="number"
          min={0}
          max={10}
          value={a}
          onChange={(e) => setA(parseInt(e.target.value) || 0)}
          className="w-12 h-8 text-center border rounded text-sm"
          disabled={disabled}
        />
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs text-offense">O:</Label>
        <input
          type="number"
          min={0}
          max={10}
          value={o}
          onChange={(e) => setO(parseInt(e.target.value) || 0)}
          className="w-12 h-8 text-center border rounded text-sm"
          disabled={disabled}
        />
      </div>
      <Button
        size="sm"
        onClick={() => onScore(a, o)}
        disabled={disabled}
      >
        Score
      </Button>
    </div>
  );
}
