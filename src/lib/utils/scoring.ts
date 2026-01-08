import type { Score } from "@/types";

/**
 * Calculate the total score (T = A - O)
 */
export function calculateTotal(accomplishments: number, offenses: number): number {
  return accomplishments - offenses;
}

/**
 * Validate a score value (must be 0-10)
 */
export function validateScore(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 10;
}

/**
 * Parse score input (handles string inputs and validates)
 */
export function parseScoreInput(input: string | number): number | null {
  const value = typeof input === "string" ? parseInt(input, 10) : input;
  if (isNaN(value) || !validateScore(value)) {
    return null;
  }
  return value;
}

/**
 * Create a Score object
 */
export function createScore(accomplishments: number, offenses: number): Score {
  return {
    accomplishments,
    offenses,
    total: calculateTotal(accomplishments, offenses),
  };
}

/**
 * Get the color class for a total score
 */
export function getTotalScoreColor(total: number): string {
  if (total >= 5) return "text-accomplishment";
  if (total >= 0) return "text-total-neutral";
  return "text-offense";
}

/**
 * Get the background color class for a total score
 */
export function getTotalScoreBgColor(total: number): string {
  if (total >= 5) return "bg-accomplishment/10";
  if (total >= 0) return "bg-yellow-500/10";
  return "bg-offense/10";
}

/**
 * Format a score for display (with + sign for positive)
 */
export function formatScore(score: number): string {
  if (score > 0) return `+${score}`;
  return score.toString();
}

/**
 * Format a decimal score
 */
export function formatDecimalScore(score: number | string | null): string {
  if (score === null) return "N/A";
  const num = typeof score === "string" ? parseFloat(score) : score;
  if (isNaN(num)) return "N/A";
  const formatted = num.toFixed(1);
  if (num > 0) return `+${formatted}`;
  return formatted;
}

/**
 * Calculate the average of an array of scores
 */
export function calculateAverageScore(scores: Score[]): Score {
  if (scores.length === 0) {
    return { accomplishments: 0, offenses: 0, total: 0 };
  }

  const sum = scores.reduce(
    (acc, score) => ({
      accomplishments: acc.accomplishments + score.accomplishments,
      offenses: acc.offenses + score.offenses,
      total: acc.total + score.total,
    }),
    { accomplishments: 0, offenses: 0, total: 0 }
  );

  return {
    accomplishments: sum.accomplishments / scores.length,
    offenses: sum.offenses / scores.length,
    total: sum.total / scores.length,
  };
}

/**
 * Determine if a score pattern is suspicious (potential bot)
 */
export function isSuspiciousScorePattern(scores: Score[]): boolean {
  if (scores.length < 10) return false;

  // Check for extreme voting pattern (always max A or max O)
  const extremeVotes = scores.filter(
    (s) =>
      (s.accomplishments === 10 && s.offenses === 0) ||
      (s.accomplishments === 0 && s.offenses === 10)
  );

  return extremeVotes.length / scores.length > 0.8;
}
