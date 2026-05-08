import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      wellKnown: "https://accounts.google.com/.well-known/openid-configuration",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
      checks: [],
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) return null
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      // Always refresh user data from database on sign in
      if (trigger === "signIn" || !token.sub) {
        if (account && profile?.email) {
          // Find or create user in database
          let dbUser = await prisma.user.findUnique({
            where: { email: profile.email },
          })
          
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.name,
                image: profile.picture,
              },
            })
          }
          
          token.sub = dbUser.id
          token.email = dbUser.email || undefined
          token.picture = dbUser.image || undefined
          token.name = dbUser.name || undefined
          return token
        }
      }
      
      // For other cases, use existing token data
      if (user) {
        token.sub = user.id
        token.email = user.email || undefined
        token.picture = user.image || undefined
        token.name = user.name || undefined
      }
      
      return token
    },
    async session({ session, token }) {
      // Get fresh user data from database
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
        })
        
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.email = dbUser.email || ""
          session.user.image = dbUser.image
          session.user.name = dbUser.name
        } else {
          // Fallback to token data
          session.user.id = token.sub as string
          session.user.email = token.email as string
          session.user.image = token.picture as string
          session.user.name = token.name as string
        }
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/signin",
  },
})
