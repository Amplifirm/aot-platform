import type { SubscriptionTier, TierPermissions, UserType } from "@/types";

// Tier permissions configuration
const TIER_PERMISSIONS: Record<SubscriptionTier, TierPermissions> = {
  T1: {
    canVote: true,
    explanationLimit: 140,
    responseLimit: 1,
    canJoinGroups: true,
    canCreateGroups: false,
    canAddHyperlinks: false,
    canUploadDocuments: false,
    unlimitedResponses: false,
  },
  T2: {
    canVote: true,
    explanationLimit: 140,
    responseLimit: null,
    canJoinGroups: true,
    canCreateGroups: true,
    canAddHyperlinks: false,
    canUploadDocuments: false,
    unlimitedResponses: true,
  },
  T3: {
    canVote: true,
    explanationLimit: 500,
    responseLimit: null,
    canJoinGroups: true,
    canCreateGroups: true,
    canAddHyperlinks: true,
    canUploadDocuments: false,
    unlimitedResponses: true,
  },
  T4: {
    canVote: true,
    explanationLimit: 50000,
    responseLimit: null,
    canJoinGroups: true,
    canCreateGroups: true,
    canAddHyperlinks: true,
    canUploadDocuments: false,
    unlimitedResponses: true,
  },
  T5: {
    canVote: true,
    explanationLimit: null, // Unlimited
    responseLimit: null,
    canJoinGroups: true,
    canCreateGroups: true,
    canAddHyperlinks: true,
    canUploadDocuments: true,
    unlimitedResponses: true,
  },
};

// Pricing by user type and tier (in cents)
export const PRICING: Record<
  Exclude<UserType, "anonymous">,
  Record<SubscriptionTier, number>
> = {
  registered: {
    T1: 0,
    T2: 100, // $1.00
    T3: 500, // $5.00
    T4: 1000, // $10.00
    T5: 5000, // $50.00
  },
  authenticated: {
    T1: 0,
    T2: 0, // Free for authenticated
    T3: 100, // $1.00
    T4: 500, // $5.00
    T5: 1000, // $10.00
  },
};

export function getTierPermissions(tier: SubscriptionTier): TierPermissions {
  return TIER_PERMISSIONS[tier];
}

export function getTierCharLimit(tier: SubscriptionTier): number | null {
  return TIER_PERMISSIONS[tier].explanationLimit;
}

export function canPerformAction(
  tier: SubscriptionTier,
  action: keyof TierPermissions
): boolean {
  const permissions = TIER_PERMISSIONS[tier];
  const value = permissions[action];
  return typeof value === "boolean" ? value : value !== 0;
}

export function getTierPrice(
  userType: Exclude<UserType, "anonymous">,
  tier: SubscriptionTier
): number {
  return PRICING[userType][tier];
}

export function getTierFeatures(tier: SubscriptionTier): string[] {
  const features: Record<SubscriptionTier, string[]> = {
    T1: ["Vote on targets", "140 character explanations", "Join groups"],
    T2: [
      "Everything in T1",
      "Unlimited responses",
      "Create groups",
    ],
    T3: [
      "Everything in T2",
      "500 character explanations",
      "Add hyperlinks",
    ],
    T4: [
      "Everything in T3",
      "50,000 character explanations",
    ],
    T5: [
      "Everything in T4",
      "Unlimited explanations",
      "Upload documents",
    ],
  };
  return features[tier];
}

export function getEffectiveTier(
  userType: UserType,
  paidTier: SubscriptionTier
): SubscriptionTier {
  // Authenticated users get T2 features for free
  if (userType === "authenticated" && paidTier === "T1") {
    return "T2";
  }
  return paidTier;
}
