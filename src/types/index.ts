// User types
export type UserType = "anonymous" | "registered" | "authenticated";
export type SubscriptionTier = "T1" | "T2" | "T3" | "T4" | "T5";
export type Role = "user" | "moderator" | "admin";
export type ModerationStatus = "pending" | "approved" | "rejected" | "dumpster";
export type TargetType = "person" | "country" | "idea";

// Session user type extension
export interface SessionUser {
  id: string;
  aotId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  userType: UserType;
  subscriptionTier: SubscriptionTier;
  karma: number;
  role: Role;
}

// Score type
export interface Score {
  accomplishments: number;
  offenses: number;
  total: number;
}

// Tier permissions
export interface TierPermissions {
  canVote: boolean;
  explanationLimit: number | null;
  responseLimit: number | null;
  canJoinGroups: boolean;
  canCreateGroups: boolean;
  canAddHyperlinks: boolean;
  canUploadDocuments: boolean;
  unlimitedResponses: boolean;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Target with votes for display
export interface TargetWithStats {
  id: string;
  slug: string;
  name: string;
  targetType: TargetType;
  shortDescription: string | null;
  imageUrl: string | null;
  wikipediaUrl: string | null;
  avgAccomplishments: number;
  avgOffenses: number;
  avgTotal: number;
  masterTotal: number | null;
  authTotal: number | null;
  totalVotes: number;
  registeredVotes: number;
  authenticatedVotes: number;
}

// Vote with user info for display
export interface VoteWithUser {
  id: string;
  accomplishments: number;
  offenses: number;
  total: number;
  explanation: string | null;
  thumbsUp: number;
  thumbsDown: number;
  netKarma: number;
  createdAt: Date;
  user: {
    id: string;
    aotId: string;
    displayName: string | null;
    avatarUrl: string | null;
    userType: UserType;
  };
}

// Comment/communication type
export interface CommentWithUser {
  id: string;
  content: string;
  thumbsUp: number;
  thumbsDown: number;
  netKarma: number;
  createdAt: Date;
  user: {
    id: string;
    aotId: string;
    displayName: string | null;
    avatarUrl: string | null;
    userType: UserType;
  };
  replies?: CommentWithUser[];
}

// Group with stats
export interface GroupWithStats {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  memberCount: number;
  totalKarma: number;
  totalScores: number;
  isPublic: boolean;
  creator: {
    id: string;
    aotId: string;
    displayName: string | null;
  };
}
