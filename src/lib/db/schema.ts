import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  boolean,
  pgEnum,
  jsonb,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============ ENUMS ============

export const userTypeEnum = pgEnum("user_type", [
  "anonymous",
  "registered",
  "authenticated",
]);

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
]);

export const targetTypeEnum = pgEnum("target_type", [
  "person",
  "country",
  "idea",
]);

export const moderationStatusEnum = pgEnum("moderation_status", [
  "pending",
  "approved",
  "rejected",
  "dumpster",
]);

export const roleEnum = pgEnum("role", ["user", "moderator", "admin"]);

// ============ USERS TABLE ============

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    aotId: varchar("aot_id", { length: 20 }).unique(),
    userType: userTypeEnum("user_type").notNull().default("anonymous"),
    email: varchar("email", { length: 255 }).unique(),
    emailVerified: timestamp("email_verified"),
    passwordHash: varchar("password_hash", { length: 255 }),
    displayName: varchar("display_name", { length: 100 }),
    name: varchar("name", { length: 100 }),
    image: text("image"),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),

    // Social account links for verification
    linkedSocialAccounts: jsonb("linked_social_accounts").$type<{
      google?: string;
      twitter?: string;
      facebook?: string;
      linkedin?: string;
    }>(),

    // Subscription
    subscriptionTier: subscriptionTierEnum("subscription_tier")
      .notNull()
      .default("T1"),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    subscriptionEndsAt: timestamp("subscription_ends_at"),

    // Stats
    karma: integer("karma").notNull().default(0),
    totalVotes: integer("total_votes").notNull().default(0),
    totalComments: integer("total_comments").notNull().default(0),

    // Role & Status
    role: roleEnum("role").notNull().default("user"),
    isBanned: boolean("is_banned").notNull().default(false),
    bannedReason: text("banned_reason"),

    // Bot detection
    suspiciousActivityScore: integer("suspicious_activity_score")
      .notNull()
      .default(0),
    lastActivityIp: varchar("last_activity_ip", { length: 45 }),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastLoginAt: timestamp("last_login_at"),
  },
  (table) => [
    index("users_aot_id_idx").on(table.aotId),
    index("users_email_idx").on(table.email),
    index("users_user_type_idx").on(table.userType),
  ]
);

// ============ NEXTAUTH TABLES ============

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index("accounts_user_id_idx").on(table.userId),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires").notNull(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)]
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires").notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
);

// ============ TARGETS TABLE ============

export const targets = pgTable(
  "targets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    targetType: targetTypeEnum("target_type").notNull(),

    // Description & metadata
    shortDescription: text("short_description"),
    longDescription: text("long_description"),
    wikipediaUrl: text("wikipedia_url"),
    imageUrl: text("image_url"),

    // Flexible metadata
    metadata: jsonb("metadata").$type<{
      birthDate?: string;
      deathDate?: string;
      nationality?: string;
      occupation?: string[];
      region?: string;
      ideologyType?: string;
      aliases?: string[];
    }>(),

    // Aggregate Scores (denormalized for performance)
    avgAccomplishments: decimal("avg_accomplishments", {
      precision: 4,
      scale: 2,
    }).default("0"),
    avgOffenses: decimal("avg_offenses", { precision: 4, scale: 2 }).default(
      "0"
    ),
    avgTotal: decimal("avg_total", { precision: 5, scale: 2 }).default("0"),

    // Vote counts by user type
    totalVotes: integer("total_votes").notNull().default(0),
    anonymousVotes: integer("anonymous_votes").notNull().default(0),
    registeredVotes: integer("registered_votes").notNull().default(0),
    authenticatedVotes: integer("authenticated_votes").notNull().default(0),

    // Master score (registered users only, most recent per user)
    masterAccomplishments: decimal("master_accomplishments", {
      precision: 4,
      scale: 2,
    }),
    masterOffenses: decimal("master_offenses", { precision: 4, scale: 2 }),
    masterTotal: decimal("master_total", { precision: 5, scale: 2 }),

    // Authenticated score
    authAccomplishments: decimal("auth_accomplishments", {
      precision: 4,
      scale: 2,
    }),
    authOffenses: decimal("auth_offenses", { precision: 4, scale: 2 }),
    authTotal: decimal("auth_total", { precision: 5, scale: 2 }),

    // Status
    isActive: boolean("is_active").notNull().default(true),
    moderationStatus: moderationStatusEnum("moderation_status")
      .notNull()
      .default("approved"),
    suggestedById: uuid("suggested_by_id").references(() => users.id),
    isPinned: boolean("is_pinned").notNull().default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("targets_slug_idx").on(table.slug),
    index("targets_type_idx").on(table.targetType),
    index("targets_master_total_idx").on(table.masterTotal),
    index("targets_is_active_idx").on(table.isActive),
  ]
);

// ============ TARGET VARIANTS TABLE ============

export const targetVariants = pgTable(
  "target_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetId: uuid("target_id")
      .notNull()
      .references(() => targets.id, { onDelete: "cascade" }),
    variantName: varchar("variant_name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    timeframeStart: varchar("timeframe_start", { length: 50 }),
    timeframeEnd: varchar("timeframe_end", { length: 50 }),

    // Aggregate scores
    avgAccomplishments: decimal("avg_accomplishments", {
      precision: 4,
      scale: 2,
    }).default("0"),
    avgOffenses: decimal("avg_offenses", { precision: 4, scale: 2 }).default(
      "0"
    ),
    avgTotal: decimal("avg_total", { precision: 5, scale: 2 }).default("0"),
    totalVotes: integer("total_votes").notNull().default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("target_variants_target_id_idx").on(table.targetId)]
);

// ============ VOTES TABLE ============

export const votes = pgTable(
  "votes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    targetId: uuid("target_id")
      .notNull()
      .references(() => targets.id),
    targetVariantId: uuid("target_variant_id").references(
      () => targetVariants.id
    ),

    // A-O-T scores (0-10 scale, stored as integers for 0-100)
    accomplishments: integer("accomplishments").notNull(),
    offenses: integer("offenses").notNull(),
    total: integer("total").notNull(), // calculated: A - O

    // Explanation
    explanation: text("explanation"),
    characterCount: integer("character_count").notNull().default(0),

    // Karma received
    thumbsUp: integer("thumbs_up").notNull().default(0),
    thumbsDown: integer("thumbs_down").notNull().default(0),
    netKarma: integer("net_karma").notNull().default(0),

    // Moderation
    moderationStatus: moderationStatusEnum("moderation_status")
      .notNull()
      .default("approved"),
    isPinned: boolean("is_pinned").notNull().default(false),
    pinnedByAdmin: boolean("pinned_by_admin").notNull().default(false),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("votes_user_target_idx").on(table.userId, table.targetId),
    index("votes_target_idx").on(table.targetId),
    index("votes_created_at_idx").on(table.createdAt),
    uniqueIndex("votes_user_target_unique_idx").on(table.userId, table.targetId),
  ]
);

// ============ VOTING HISTORY TABLE ============

export const votingHistory = pgTable(
  "voting_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetId: uuid("target_id")
      .notNull()
      .references(() => targets.id),
    snapshotDate: timestamp("snapshot_date").notNull(),

    avgAccomplishments: decimal("avg_accomplishments", {
      precision: 4,
      scale: 2,
    }).notNull(),
    avgOffenses: decimal("avg_offenses", { precision: 4, scale: 2 }).notNull(),
    avgTotal: decimal("avg_total", { precision: 5, scale: 2 }).notNull(),
    totalVotes: integer("total_votes").notNull(),

    masterTotal: decimal("master_total", { precision: 5, scale: 2 }),
    authTotal: decimal("auth_total", { precision: 5, scale: 2 }),
  },
  (table) => [
    index("voting_history_target_date_idx").on(
      table.targetId,
      table.snapshotDate
    ),
  ]
);

// ============ EVENT LABELS TABLE ============

export const eventLabels = pgTable(
  "event_labels",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetId: uuid("target_id")
      .notNull()
      .references(() => targets.id),
    eventDate: timestamp("event_date").notNull(),
    label: varchar("label", { length: 255 }).notNull(),
    description: text("description"),
    sourceUrl: text("source_url"),
    createdById: uuid("created_by_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("event_labels_target_idx").on(table.targetId)]
);

// ============ TAGS TABLE ============

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  category: varchar("category", { length: 50 }),
  isBanned: boolean("is_banned").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const targetTags = pgTable(
  "target_tags",
  {
    targetId: uuid("target_id")
      .notNull()
      .references(() => targets.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.targetId, table.tagId] })]
);

// ============ COMMUNICATIONS TABLE ============

export const communications = pgTable(
  "communications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id"),
    voteId: uuid("vote_id").references(() => votes.id, { onDelete: "cascade" }),
    targetId: uuid("target_id").references(() => targets.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),

    content: text("content").notNull(),
    characterCount: integer("character_count").notNull(),

    // Karma
    thumbsUp: integer("thumbs_up").notNull().default(0),
    thumbsDown: integer("thumbs_down").notNull().default(0),
    netKarma: integer("net_karma").notNull().default(0),

    // Moderation
    moderationStatus: moderationStatusEnum("moderation_status")
      .notNull()
      .default("approved"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("communications_vote_idx").on(table.voteId),
    index("communications_target_idx").on(table.targetId),
    index("communications_parent_idx").on(table.parentId),
    index("communications_user_idx").on(table.userId),
  ]
);

// ============ KARMA TRANSACTIONS TABLE ============

export const karmaTransactions = pgTable(
  "karma_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromUserId: uuid("from_user_id")
      .notNull()
      .references(() => users.id),
    toUserId: uuid("to_user_id")
      .notNull()
      .references(() => users.id),

    voteId: uuid("vote_id").references(() => votes.id, { onDelete: "cascade" }),
    communicationId: uuid("communication_id").references(
      () => communications.id,
      { onDelete: "cascade" }
    ),

    value: integer("value").notNull(), // +1 or -1
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("karma_from_user_idx").on(table.fromUserId),
    uniqueIndex("karma_unique_vote_idx").on(table.fromUserId, table.voteId),
    uniqueIndex("karma_unique_comm_idx").on(
      table.fromUserId,
      table.communicationId
    ),
  ]
);

// ============ GROUPS TABLE ============

export const groups = pgTable(
  "groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),

    createdById: uuid("created_by_id")
      .notNull()
      .references(() => users.id),

    // Stats
    memberCount: integer("member_count").notNull().default(1),
    totalKarma: integer("total_karma").notNull().default(0),
    totalScores: integer("total_scores").notNull().default(0),

    pinnedTargetId: uuid("pinned_target_id").references(() => targets.id),

    isPublic: boolean("is_public").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("groups_slug_idx").on(table.slug),
    index("groups_member_count_idx").on(table.memberCount),
  ]
);

// ============ GROUP MEMBERSHIPS TABLE ============

export const groupMemberships = pgTable(
  "group_memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).notNull().default("member"),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    index("group_memberships_group_user_idx").on(table.groupId, table.userId),
    index("group_memberships_user_idx").on(table.userId),
    uniqueIndex("group_memberships_unique_idx").on(table.groupId, table.userId),
  ]
);

// ============ MODERATION QUEUE TABLE ============

export const moderationQueue = pgTable(
  "moderation_queue",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    voteId: uuid("vote_id").references(() => votes.id, { onDelete: "cascade" }),
    communicationId: uuid("communication_id").references(
      () => communications.id,
      { onDelete: "cascade" }
    ),
    targetId: uuid("target_id").references(() => targets.id, {
      onDelete: "cascade",
    }),
    userId: uuid("user_id").references(() => users.id),

    reason: text("reason").notNull(),
    reportedById: uuid("reported_by_id").references(() => users.id),

    status: moderationStatusEnum("status").notNull().default("pending"),
    reviewedById: uuid("reviewed_by_id").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    reviewNotes: text("review_notes"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("moderation_queue_status_idx").on(table.status),
    index("moderation_queue_created_idx").on(table.createdAt),
  ]
);

// ============ REMOVED ITEMS TABLE (DUMPSTER) ============

export const removedItems = pgTable(
  "removed_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    originalTable: varchar("original_table", { length: 50 }).notNull(),
    originalId: uuid("original_id").notNull(),
    originalData: jsonb("original_data").notNull(),
    removalReason: text("removal_reason").notNull(),
    removedById: uuid("removed_by_id").references(() => users.id),
    removedAt: timestamp("removed_at").defaultNow().notNull(),
  },
  (table) => [index("removed_items_table_idx").on(table.originalTable)]
);

// ============ SUGGESTIONS TABLE ============

export const suggestions = pgTable(
  "suggestions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    suggestedById: uuid("suggested_by_id")
      .notNull()
      .references(() => users.id),
    targetType: targetTypeEnum("target_type").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    wikipediaUrl: text("wikipedia_url"),
    category: varchar("category", { length: 100 }),

    // Voting on suggestions
    thumbsUp: integer("thumbs_up").notNull().default(0),
    thumbsDown: integer("thumbs_down").notNull().default(0),

    status: varchar("status", { length: 20 }).notNull().default("pending"),
    reviewedById: uuid("reviewed_by_id").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    createdTargetId: uuid("created_target_id").references(() => targets.id),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("suggestions_status_idx").on(table.status),
    index("suggestions_type_idx").on(table.targetType),
  ]
);

// ============ SUBSCRIPTION PLANS TABLE ============

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  tier: subscriptionTierEnum("tier").notNull(),
  userType: userTypeEnum("user_type").notNull(),
  stripePriceId: varchar("stripe_price_id", { length: 255 }).notNull(),
  stripeProductId: varchar("stripe_product_id", { length: 255 }).notNull(),
  priceMonthly: integer("price_monthly").notNull(), // in cents
  features: jsonb("features").$type<string[]>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ BLOG POSTS TABLE ============

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    imageUrl: text("image_url"),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),

    isPublished: boolean("is_published").notNull().default(false),
    publishedAt: timestamp("published_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("blog_posts_slug_idx").on(table.slug),
    index("blog_posts_published_idx").on(table.isPublished, table.publishedAt),
  ]
);

// ============ SYSTEM LOG TABLE ============

export const systemLog = pgTable(
  "system_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: varchar("event_type", { length: 100 }).notNull(),
    userId: uuid("user_id").references(() => users.id),
    targetId: uuid("target_id").references(() => targets.id),
    details: jsonb("details"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("system_log_event_type_idx").on(table.eventType),
    index("system_log_created_at_idx").on(table.createdAt),
    index("system_log_user_idx").on(table.userId),
  ]
);

// ============ RELATIONS ============

export const usersRelations = relations(users, ({ many }) => ({
  votes: many(votes),
  communications: many(communications),
  groupMemberships: many(groupMemberships),
  createdGroups: many(groups),
  blogPosts: many(blogPosts),
}));

export const targetsRelations = relations(targets, ({ many, one }) => ({
  votes: many(votes),
  variants: many(targetVariants),
  eventLabels: many(eventLabels),
  votingHistory: many(votingHistory),
  suggestedBy: one(users, {
    fields: [targets.suggestedById],
    references: [users.id],
  }),
}));

export const votesRelations = relations(votes, ({ one, many }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  target: one(targets, {
    fields: [votes.targetId],
    references: [targets.id],
  }),
  communications: many(communications),
}));

export const communicationsRelations = relations(
  communications,
  ({ one, many }) => ({
    user: one(users, {
      fields: [communications.userId],
      references: [users.id],
    }),
    vote: one(votes, {
      fields: [communications.voteId],
      references: [votes.id],
    }),
    target: one(targets, {
      fields: [communications.targetId],
      references: [targets.id],
    }),
    parent: one(communications, {
      fields: [communications.parentId],
      references: [communications.id],
      relationName: "parentChild",
    }),
    replies: many(communications, { relationName: "parentChild" }),
  })
);

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.createdById],
    references: [users.id],
  }),
  pinnedTarget: one(targets, {
    fields: [groups.pinnedTargetId],
    references: [targets.id],
  }),
  memberships: many(groupMemberships),
}));

export const groupMembershipsRelations = relations(
  groupMemberships,
  ({ one }) => ({
    group: one(groups, {
      fields: [groupMemberships.groupId],
      references: [groups.id],
    }),
    user: one(users, {
      fields: [groupMemberships.userId],
      references: [users.id],
    }),
  })
);

// ============ TYPE EXPORTS ============

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Target = typeof targets.$inferSelect;
export type NewTarget = typeof targets.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
export type Communication = typeof communications.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
