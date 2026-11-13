import { type NextAuthOptions } from "next-auth";
import { getServerSession as nextAuthGetServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export function getAuthOptions(): NextAuthOptions {
  return {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Optional database-free sign-in for local development only.
          // Enabled solely when both env vars are set and NODE_ENV is not "production".
          const devEmail = process.env.DEV_ADMIN_EMAIL;
          const devPassword = process.env.DEV_ADMIN_PASSWORD;
          if (
            process.env.NODE_ENV !== "production" &&
            devEmail &&
            devPassword &&
            credentials.email === devEmail &&
            credentials.password === devPassword
          ) {
            return {
              id: "admin-001",
              email: devEmail,
              name: "Admin",
              role: "ADMIN",
            };
          }

          try {
            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
            });

            if (!user) return null;

            const isValid = await bcrypt.compare(
              credentials.password,
              user.password
            );
            if (!isValid) return null;

            await prisma.user.update({
              where: { id: user.id },
              data: { lastLogin: new Date() },
            });

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          } catch {
            return null;
          }
        },
      }),
    ],
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.role = (user as unknown as { role: string }).role;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          (session.user as { id: string }).id = token.id as string;
          (session.user as { role: string }).role = token.role as string;
        }
        return session;
      },
    },
    pages: {
      signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
}

export async function getServerAuthSession() {
  return nextAuthGetServerSession(getAuthOptions());
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
