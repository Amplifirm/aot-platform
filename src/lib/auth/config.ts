import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { UserType, SubscriptionTier, Role } from "@/types";

// Generate AOT ID based on user type
function generateAotId(userType: UserType): string {
  const prefix = userType === "anonymous" ? "A" : userType === "registered" ? "R" : "Auth";
  const randomNum = Math.floor(Math.random() * 100000);
  return `${prefix}-${randomNum}`;
}

// Build providers array - only include OAuth if credentials exist
const providers: any[] = [];

// Always include credentials provider
providers.push(
  Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const passwordValid = await bcrypt.compare(password, user.passwordHash);

        if (!passwordValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.displayName || user.name,
          image: user.avatarUrl || user.image,
          aotId: user.aotId ?? undefined,
          userType: user.userType,
          subscriptionTier: user.subscriptionTier,
          karma: user.karma,
          role: user.role,
        };
      },
    })
);

// Only add Google provider if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

// Only add Twitter provider if credentials are configured
if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
  providers.push(
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/register/complete",
  },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // User just signed in
        if (account?.provider === "credentials") {
          // Credentials login - user object already has all fields
          token.id = user.id as string;
          token.aotId = (user as any).aotId;
          token.userType = (user as any).userType;
          token.subscriptionTier = (user as any).subscriptionTier;
          token.karma = (user as any).karma;
          token.role = (user as any).role;
        } else {
          // OAuth login - need to fetch or create user
          const email = user.email;
          if (email) {
            let dbUser = await db.query.users.findFirst({
              where: eq(users.email, email),
            });

            if (!dbUser) {
              // Create new authenticated user
              const aotId = generateAotId("authenticated");
              const [newUser] = await db
                .insert(users)
                .values({
                  email: email,
                  name: user.name || null,
                  displayName: user.name || null,
                  image: user.image || null,
                  avatarUrl: user.image || null,
                  aotId,
                  userType: "authenticated",
                  subscriptionTier: "T1",
                  karma: 0,
                  role: "user",
                  emailVerified: new Date(),
                })
                .returning();
              dbUser = newUser;
            } else if (dbUser.userType === "registered") {
              // Upgrade to authenticated
              const newAotId = generateAotId("authenticated");
              await db
                .update(users)
                .set({
                  userType: "authenticated",
                  aotId: newAotId,
                  emailVerified: new Date(),
                })
                .where(eq(users.id, dbUser.id));
              dbUser = { ...dbUser, userType: "authenticated", aotId: newAotId };
            }

            token.id = dbUser.id;
            token.aotId = dbUser.aotId || generateAotId("authenticated");
            token.userType = dbUser.userType;
            token.subscriptionTier = dbUser.subscriptionTier;
            token.karma = dbUser.karma;
            token.role = dbUser.role;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.aotId = token.aotId as string;
        session.user.userType = token.userType as UserType;
        session.user.subscriptionTier = token.subscriptionTier as SubscriptionTier;
        session.user.karma = token.karma as number;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});

// Extend the session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      aotId: string;
      userType: UserType;
      subscriptionTier: SubscriptionTier;
      karma: number;
      role: Role;
    };
  }

  interface User {
    aotId?: string;
    userType?: UserType;
    subscriptionTier?: SubscriptionTier;
    karma?: number;
    role?: Role;
  }
}

