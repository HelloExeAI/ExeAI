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
        try {
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
        } catch (error) {
          console.error('Error fetching user data in session callback:', error)
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
      // Always allow sign-in to proceed
      return true
    },

    // Redirect callback to handle post-login navigation
    async redirect({ url, baseUrl }) {
      // Ensure baseUrl is properly formatted
      const base = baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000'
      
      // If url contains error, redirect to dashboard (will show error on signin page)
      if (url.includes('error=')) {
        return `${base}/dashboard`
      }
      
      // If url is the callback endpoint, redirect to dashboard
      if (url.includes('/api/auth/callback')) {
        return `${base}/dashboard`
      }
      
      // Parse callbackUrl from query parameters if present
      try {
        // Handle both relative and absolute URLs
        const urlToParse = url.startsWith('http') ? url : `${base}${url.startsWith('/') ? url : '/' + url}`
        const urlObj = new URL(urlToParse)
        const callbackUrl = urlObj.searchParams.get('callbackUrl')
        
        if (callbackUrl) {
          // Decode the callback URL
          const decodedUrl = decodeURIComponent(callbackUrl)
          
          // If it's a relative path, prepend baseUrl
          if (decodedUrl.startsWith('/')) {
            return `${base}${decodedUrl}`
          }
          
          // If it's absolute and same origin, use it
          try {
            const callbackUrlObj = new URL(decodedUrl)
            const baseUrlObj = new URL(base)
            if (callbackUrlObj.origin === baseUrlObj.origin) {
              return decodedUrl
            }
          } catch {
            // Invalid absolute URL, fall through to default
          }
        }
      } catch (error) {
        // URL parsing failed, log and continue with default logic
        if (process.env.NODE_ENV === 'development') {
          console.error('Error parsing redirect URL:', error, { url, baseUrl })
        }
      }
      
      // If url is a relative path, prepend baseUrl
      if (url.startsWith("/")) {
        // Don't redirect to error pages or callback endpoints
        if (url.includes('/auth/signin') || url.includes('/api/auth/')) {
          return `${base}/dashboard`
        }
        return `${base}${url}`
      }
      
      // If url is on the same origin, allow it (unless it's an error/callback)
      if (url.startsWith(base)) {
        if (url.includes('/auth/signin') || url.includes('/api/auth/callback')) {
          return `${base}/dashboard`
        }
        return url
      }
      
      // Default: redirect to dashboard after successful login
      return `${base}/dashboard`
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
        
        console.log(`✅ Trial set up for new user: ${user.email}`)
      } catch (error) {
        console.error('Error setting up trial for new user:', error)
      }
    },
    
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`✅ User signed in: ${user.email} | New user: ${isNewUser}`)
    },
  },

  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/signin', // Redirect errors to signin page
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

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    return user?.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error)
    return null
  }
}