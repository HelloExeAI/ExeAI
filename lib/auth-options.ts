// lib/auth-options.ts
// NextAuth configuration options

import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),

    // Email/Password Provider
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],

  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.sub || user?.id || ''
        
        // Fetch fresh user data including subscription info
        const dbUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            subscriptionTier: true,
            subscriptionStatus: true,
            trialEndsAt: true,
            currentPeriodEnd: true,
          },
        })

        if (dbUser) {
          session.user.subscriptionTier = dbUser.subscriptionTier
          session.user.subscriptionStatus = dbUser.subscriptionStatus
          session.user.trialEndsAt = dbUser.trialEndsAt
          session.user.currentPeriodEnd = dbUser.currentPeriodEnd
        }
      }
      return session
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },

    async signIn({ user, account, profile }) {
      // Allow sign-in to proceed
      return true
    },
  },

  events: {
    async createUser({ user }) {
      // When a new user is created (by PrismaAdapter), set up trial
      try {
        const trialEndsAt = new Date()
        trialEndsAt.setDate(trialEndsAt.getDate() + 14) // 14-day trial

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionTier: 'free_trial',
            subscriptionStatus: 'active',
            trialEndsAt,
          },
        })
      } catch (error) {
        console.error('Error setting up trial for new user:', error)
      }
    },
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    newUser: '/dashboard', // Redirect new users to dashboard
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
}

// Helper function to get current user ID from session
export async function getCurrentUserId(): Promise<string | null> {
  const { getServerSession } = await import('next-auth');
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  return user?.id || null;
}