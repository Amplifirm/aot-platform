"use client";

import { cn } from "@/lib/utils";
import { formatScore, formatDecimalScore } from "@/lib/utils/scoring";

interface ScoreDisplayProps {
  accomplishments: number;
  offenses: number;
  total: number;
  size?: "sm" | "md" | "lg" | "xl";
  showLabels?: boolean;
  animated?: boolean;
  decimal?: boolean;
}

const sizeClasses = {
  sm: {
    container: "gap-2",
    score: "text-lg",
    label: "text-[10px]",
    operator: "text-lg",
  },
  md: {
    container: "gap-3",
    score: "text-2xl",
    label: "text-xs",
    operator: "text-2xl",
  },
  lg: {
    container: "gap-4",
    score: "text-4xl",
    label: "text-sm",
    operator: "text-4xl",
  },
  xl: {
    container: "gap-6",
    score: "text-6xl",
    label: "text-base",
    operator: "text-6xl",
  },
};

function getTotalColor(total: number): string {
  if (total >= 5) return "text-accomplishment";
  if (total >= 0) return "text-yellow-500";
  return "text-offense";
}

export function ScoreDisplay({
  accomplishments,
  offenses,
  total,
  size = "md",
  showLabels = true,
  animated = false,
  decimal = false,
}: ScoreDisplayProps) {
  const classes = sizeClasses[size];

  const formatFn = decimal ? formatDecimalScore : formatScore;
  const displayA = decimal ? accomplishments.toFixed(1) : accomplishments.toString();
  const displayO = decimal ? offenses.toFixed(1) : offenses.toString();
  const displayT = formatFn(total);

  return (
    <div className={cn("flex items-center justify-center", classes.container)}>
      {/* Accomplishments */}
      <div className="text-center">
        {showLabels && (
          <span className={cn("block text-muted-foreground", classes.label)}>
            A
          </span>
        )}
        <span
          className={cn(
            "font-bold text-accomplishment tabular-nums",
            classes.score,
            animated && "transition-all duration-300"
          )}
        >
          {displayA}
        </span>
      </div>

      {/* Minus */}
      <span className={cn("text-muted-foreground font-light", classes.operator)}>
        -
      </span>

      {/* Offenses */}
      <div className="text-center">
        {showLabels && (
          <span className={cn("block text-muted-foreground", classes.label)}>
            O
          </span>
        )}
        <span
          className={cn(
            "font-bold text-offense tabular-nums",
            classes.score,
            animated && "transition-all duration-300"
          )}
        >
          {displayO}
        </span>
      </div>

      {/* Equals */}
      <span className={cn("text-muted-foreground font-light", classes.operator)}>
        =
      </span>

      {/* Total */}
      <div className="text-center">
        {showLabels && (
          <span className={cn("block text-muted-foreground", classes.label)}>
            T
          </span>
        )}
        <span
          className={cn(
            "font-bold tabular-nums",
            classes.score,
            getTotalColor(total),
            animated && "transition-all duration-300"
          )}
        >
          {displayT}
        </span>
      </div>
    </div>
  );
}

// Compact inline version
interface ScoreInlineProps {
  accomplishments: number;
  offenses: number;
  total: number;
  className?: string;
}

export function ScoreInline({
  accomplishments,
  offenses,
  total,
  className,
}: ScoreInlineProps) {
  return (
    <span className={cn("font-mono text-sm", className)}>
      <span className="text-accomplishment">{accomplishments}</span>
      <span className="text-muted-foreground">-</span>
      <span className="text-offense">{offenses}</span>
      <span className="text-muted-foreground">=</span>
      <span className={getTotalColor(total)}>{formatScore(total)}</span>
    </span>
  );
}

// Score badge for cards
interface ScoreBadgeProps {
  total: number;
  size?: "sm" | "md";
  className?: string;
}

export function ScoreBadge({ total, size = "md", className }: ScoreBadgeProps) {
  const bgColor =
    total >= 5
      ? "bg-accomplishment/10 text-accomplishment"
      : total >= 0
      ? "bg-yellow-500/10 text-yellow-600"
      : "bg-offense/10 text-offense";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-bold tabular-nums",
        size === "sm" ? "h-6 w-10 text-xs" : "h-8 w-12 text-sm",
        bgColor,
        className
      )}
    >
      {formatScore(total)}
    </span>
  );
}
