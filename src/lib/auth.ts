import "server-only";

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getServerSession } from "next-auth/next";
import { getOrCreateGoogleUser, getUserByEmail, getUserById } from "./db";
import { DbUser } from "@/types/database";

/**
 * NextAuth configuration options
 * - Uses Google OAuth provider
 * - JWT session strategy (no database sessions)
 * - 30-day session duration
 * - Database-driven user authorization
 */
export const authOptions: NextAuthOptions = {
  // Secret for signing tokens - required in production
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // Use JWT strategy - no database sessions
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT settings
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Custom pages
  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors to login page
  },

  callbacks: {
    /**
     * Register verified Google accounts before creating a session.
     * Existing disabled accounts remain blocked.
     */
    async signIn({ user, account, profile }) {
      // Only allow Google sign-in
      if (account?.provider !== "google") {
        return false;
      }

      const email = user.email?.trim().toLowerCase();
      if (
        !email ||
        !profile ||
        !("email_verified" in profile) ||
        profile.email_verified !== true ||
        typeof profile.email !== "string" ||
        profile.email.trim().toLowerCase() !== email
      ) {
        return "/login?error=AccessDenied";
      }

      const dbUser = await getOrCreateGoogleUser(email, user.name ?? null);

      if (!dbUser) {
        return "/login?error=RegistrationFailed";
      }

      // User must be active
      if (!dbUser.is_active) {
        return "/login?error=AccessDenied";
      }

      return true;
    },

    /**
     * JWT callback - add user info to the token
     * Enriches token with database user ID and role
     */
    async jwt({ token, user, trigger }) {
      // On initial sign-in, trigger update, OR if userId is missing from token
      // This handles edge cases like tokens created before DB was set up
      if (user || trigger === "update" || !token.userId) {
        const email = token.email || user?.email;
        if (email) {
          const dbUser = await getUserByEmail(email);
          if (dbUser?.is_active) {
            token.userId = dbUser.id;
            token.role = dbUser.role;
            // Update name from DB if available
            if (dbUser.name) {
              token.name = dbUser.name;
            }
          } else {
            delete token.userId;
            delete token.role;
          }
        }
      }

      // Always include basic info
      if (user) {
        token.email = user.email;
        token.name = token.name || user.name;
        token.picture = user.image;
      }

      return token;
    },

    /**
     * Session callback - expose user info in the session
     * Makes userId and role available client-side
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        // Add database fields
        session.user.id = token.userId as number | undefined;
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },

  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
};

/**
 * Helper to get server-side session
 * Use this in Server Components and API routes
 */
export async function getAuth() {
  return getServerSession(authOptions);
}

/**
 * Helper to get the current user's database ID from session
 * Returns null if not authenticated
 */
export async function getCurrentUserId(): Promise<number | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/** Resolve current authorization from the database, including revoked sessions. */
export async function getCurrentUser(): Promise<DbUser | null> {
  const session = await getAuth();
  const id = session?.user?.id;
  const email = session?.user?.email;
  if (!Number.isSafeInteger(id) || !id || id < 1 || !email) return null;

  const user = await getUserById(id);
  if (!user?.is_active || user.email.toLowerCase() !== email.toLowerCase()) {
    return null;
  }
  return user;
}
