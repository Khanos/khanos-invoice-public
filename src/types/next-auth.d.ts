import { DefaultSession } from "next-auth";

/**
 * NextAuth type augmentation
 * Extends the default session and JWT types with custom fields
 */

declare module "next-auth" {
  interface Session {
    user: {
      /** Database user ID */
      id?: number;
      /** User role (e.g., 'user', 'admin') */
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** Database user ID */
    userId?: number;
    /** User role (e.g., 'user', 'admin') */
    role?: string;
  }
}
