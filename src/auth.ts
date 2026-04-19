import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
          include: { profile: true }
        });

        if (user && await bcrypt.compare(credentials.password as string, user.passwordHash)) {
          return { 
            id: user.id, 
            username: user.username, 
            role: user.role,
            avatarUrl: user.profile?.avatarUrl || null,
            displayName: user.profile?.displayName || null
          };
        }
        return null; // 登入失敗
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.avatarUrl = (user as any).avatarUrl;
        token.displayName = (user as any).displayName;
      }
      // Refresh avatar on session update
      if (trigger === "update" && token.id) {
        const profile = await prisma.profile.findUnique({
          where: { userId: token.id as string }
        });
        token.avatarUrl = profile?.avatarUrl || null;
        token.displayName = profile?.displayName || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).username = token.username as string;
        (session.user as any).avatarUrl = token.avatarUrl as string | null;
        (session.user as any).displayName = token.displayName as string | null;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // 自定義登入頁面
  }
})
