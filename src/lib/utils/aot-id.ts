import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

type AOTIdPrefix = "A" | "R" | "Auth";

/**
 * Generate a unique AOT ID with the given prefix
 * Format: A-123, R-456, Auth-789
 */
export async function generateAOTId(prefix: AOTIdPrefix): Promise<string> {
  // Get the highest existing ID number for this prefix
  const pattern = `${prefix}-%`;

  const result = await db
    .select({
      maxId: sql<string>`MAX(CAST(SUBSTRING(aot_id FROM '[0-9]+$') AS INTEGER))`,
    })
    .from(users)
    .where(sql`aot_id LIKE ${pattern}`);

  const maxNum = result[0]?.maxId ? parseInt(result[0].maxId, 10) : 0;
  const newNum = maxNum + 1;

  return `${prefix}-${newNum}`;
}

/**
 * Parse an AOT ID to get its components
 */
export function parseAOTId(aotId: string): {
  prefix: AOTIdPrefix;
  number: number;
} | null {
  const match = aotId.match(/^(A|R|Auth)-(\d+)$/);
  if (!match) return null;

  return {
    prefix: match[1] as AOTIdPrefix,
    number: parseInt(match[2], 10),
  };
}

/**
 * Get user type from AOT ID prefix
 */
export function getUserTypeFromAOTId(
  aotId: string
): "anonymous" | "registered" | "authenticated" | null {
  const parsed = parseAOTId(aotId);
  if (!parsed) return null;

  switch (parsed.prefix) {
    case "A":
      return "anonymous";
    case "R":
      return "registered";
    case "Auth":
      return "authenticated";
    default:
      return null;
  }
}

/**
 * Validate an AOT ID format
 */
export function isValidAOTId(aotId: string): boolean {
  return /^(A|R|Auth)-\d+$/.test(aotId);
}
