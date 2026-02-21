import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    token: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }
}