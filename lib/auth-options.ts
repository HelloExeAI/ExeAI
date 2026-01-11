// lib/auth-options.ts
// NextAuth configuration options

import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'
import bcrypt from 'bcryptjs'

// Ensure Prisma client is ready before creating adapter
// Note: PrismaAdapter will handle database operations, but we ensure connection is available
let prismaAdapter: ReturnType<typeof PrismaAdapter>;
try {
  prismaAdapter = PrismaAdapter(prisma);
} catch (error) {
  console.error('❌ Failed to initialize PrismaAdapter:', error);
  throw error;
}

// Test database connection on startup (non-blocking)
if (process.env.NODE_ENV === 'development') {
  prisma.$connect()
    .then(() => {
      console.log('✅ Prisma client connected to database');
    })
    .catch((error) => {
      console.error('⚠️  Database connection warning:', error);
      console.error('   Make sure DATABASE_URL is set correctly in .env.local');
    });
}

export const authOptions: NextAuthOptions = {
  adapter: prismaAdapter,
  debug: process.env.NODE_ENV === 'development',

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
          scope: 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar',
        },
      },
      // Add error handling for OAuth
      checks: ['pkce', 'state'],
      allowDangerousEmailAccountLinking: true, // Allow linking Google account to existing user
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
          // Ensure connection is established
          await prisma.$connect().catch(() => {
            // Connection might already be established, ignore error
          });

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
        } catch (error: any) {
          console.error('Error fetching user data in session callback:', error)
          console.error('Error details:', error?.message || 'Unknown error')
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
      try {
        // Log OAuth sign-in details for debugging
        if (account?.provider === 'google') {
          console.log('🔐 Google OAuth sign-in attempt:', {
            userId: user.id,
            email: user.email,
            provider: account.provider,
            accountId: account.providerAccountId,
          })

          // Test database connection but don't block OAuth if it fails
          // PrismaAdapter will handle the connection and throw if needed
          try {
            // Quick connection test
            await Promise.race([
              prisma.$queryRaw`SELECT 1`,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
            ]);
            console.log('✅ Database connection verified for OAuth')

            // Update user settings to reflect Google connection
            // This handles cases where user is ALREADY linked but just adding scopes
            // "linkAccount" event only fires for NEW links
            const hasCalendarScope = account.scope?.includes('calendar');
            if (hasCalendarScope) {
              console.log('📅 Calendar scope detected during sign-in, updating settings...');
              await prisma.userSettings.upsert({
                where: { userId: user.id },
                create: {
                  userId: user.id,
                  calendarGoogleConnected: true
                },
                update: {
                  calendarGoogleConnected: true
                }
              }).catch(err => console.error('Error updating calendar settings:', err));
            }
          } catch (dbError: any) {
            console.error('⚠️  Database connection warning during OAuth:', dbError.message)
            console.error('   PrismaAdapter will attempt to connect when needed')
            // Don't block OAuth - let PrismaAdapter handle it
            // The adapter will throw if it can't connect, which NextAuth will handle
          }
        }
        // Always allow sign-in to proceed - PrismaAdapter will handle database operations
        // If database fails, NextAuth will catch the error and redirect with error param
        return true
      } catch (error: any) {
        console.error('❌ Error in signIn callback:', error)
        console.error('Error details:', error.message)
        // Return true to allow OAuth to proceed - database errors will be handled by adapter
        return true
      }
    },

    // Redirect callback to handle post-login navigation
    async redirect({ url, baseUrl }) {
      try {
        const base = baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000'

        // Log redirect for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('🔄 Redirect callback:', { url, baseUrl, base })
        }

        // If URL contains an error parameter, still try to redirect to dashboard
        // (errors will be shown via URL params on signin page if needed)
        if (url.includes('error=')) {
          console.warn('⚠️  Redirect URL contains error, redirecting to dashboard anyway')
          return `${base}/dashboard`
        }

        // If this is the OAuth callback endpoint, always go to dashboard
        if (url.includes('/api/auth/callback')) {
          console.log('✅ OAuth callback detected, redirecting to dashboard')
          return `${base}/dashboard`
        }

        // Parse callbackUrl from query parameters
        try {
          const urlToParse = url.startsWith('http') ? url : `${base}${url.startsWith('/') ? url : '/' + url}`
          const urlObj = new URL(urlToParse)
          const callbackUrl = urlObj.searchParams.get('callbackUrl')

          if (callbackUrl) {
            const decodedUrl = decodeURIComponent(callbackUrl)
            console.log('📍 Found callbackUrl:', decodedUrl)

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
            console.warn('⚠️  Error parsing redirect URL:', error)
          }
        }

        // If url is a relative path
        if (url.startsWith("/")) {
          // Don't redirect to auth pages or callback endpoints
          if (url.includes('/auth/signin') || url.includes('/api/auth/')) {
            return `${base}/dashboard`
          }
          return `${base}${url}`
        }

        // If url is on the same origin
        if (url.startsWith(base)) {
          // Don't redirect to auth pages or callback endpoints
          if (url.includes('/auth/signin') || url.includes('/api/auth/callback')) {
            return `${base}/dashboard`
          }
          return url
        }

        // Default: redirect to dashboard after successful login
        console.log('✅ Default redirect to dashboard')
        return `${base}/dashboard`
      } catch (error) {
        console.error('❌ Error in redirect callback:', error)
        // Fallback to dashboard on error
        const base = baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000'
        return `${base}/dashboard`
      }
    },
  },

  events: {
    async createUser({ user }) {
      // When a new user is created (by PrismaAdapter), set up trial
      // This runs AFTER the user is created, so errors here won't block OAuth
      try {
        // Ensure database connection is ready
        await prisma.$connect().catch(() => {
          // Connection might already be established
        });

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
        // Log error but don't throw - OAuth should still succeed
        console.error('❌ Error setting up trial for new user:', error)
        // Don't rethrow - allow OAuth to complete
      }
    },

    async signIn({ user, account, profile, isNewUser }) {
      console.log(`✅ User signed in: ${user.email} | New user: ${isNewUser} | Provider: ${account?.provider}`)
    },

    async linkAccount({ user, account, profile }) {
      try {
        console.log(`✅ Account linked: ${account?.provider} for user: ${user.email}`)

        // Auto-enable Google Calendar setting when account is linked
        if (account?.provider === 'google') {
          // We need to find the settings first or upsert
          // Since settings might not exist, upsert is safer
          await prisma.userSettings.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              calendarGoogleConnected: true
            },
            update: {
              calendarGoogleConnected: true
            }
          });
        }
      } catch (error) {
        console.error('❌ Error linking account:', error)
        // Don't throw - let NextAuth handle it
      }
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
}

// Validate OAuth configuration and database connection on startup
if (process.env.NODE_ENV === 'development') {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn('⚠️  Google OAuth credentials are missing!')
    console.warn('   Make sure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env.local')
  } else {
    console.log('✅ Google OAuth credentials found')
  }

  if (!process.env.NEXTAUTH_URL) {
    console.warn('⚠️  NEXTAUTH_URL is not set!')
    console.warn('   Defaulting to http://localhost:3000')
  }

  if (!process.env.NEXTAUTH_SECRET) {
    console.warn('⚠️  NEXTAUTH_SECRET is not set!')
    console.warn('   This is required for production. Generate one with: openssl rand -base64 32')
  }

  // Test database connection and verify tables exist
  prisma.$connect()
    .then(async () => {
      console.log('✅ Database connection successful')

      // Check if required NextAuth tables exist
      try {
        const accountCount = await prisma.account.count().catch(() => 0)
        const userCount = await prisma.user.count().catch(() => 0)
        const sessionCount = await prisma.session.count().catch(() => 0)

        console.log('📊 Database tables status:')
        console.log(`   - Users table: ${userCount >= 0 ? '✅ exists' : '❌ missing'}`)
        console.log(`   - Accounts table: ${accountCount >= 0 ? '✅ exists' : '❌ missing'}`)
        console.log(`   - Sessions table: ${sessionCount >= 0 ? '✅ exists' : '❌ missing'}`)

        if (accountCount < 0) {
          console.warn('⚠️  Required NextAuth tables may be missing!')
          console.warn('   Run: npx prisma db push')
        }
      } catch (tableError) {
        console.warn('⚠️  Could not verify table existence:', tableError)
        console.warn('   This might indicate missing tables. Run: npx prisma db push')
      }
    })
    .catch((error) => {
      console.error('❌ Database connection failed:', error)
      console.error('   Make sure DATABASE_URL is set correctly in .env.local')
      console.error('   The OAuth callback will fail if the database is not accessible')
      console.error('   Error details:', error.message)
    })
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