// src/types/next-auth.d.ts

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique ID from the database. */
      id: string;
    } & DefaultSession["user"]; // Keep the default properties
  }
}