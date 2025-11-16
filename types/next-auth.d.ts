// types/next-auth.d.ts
// Extend NextAuth types to include custom fields

import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      subscriptionTier?: string | null
      subscriptionStatus?: string | null
      trialEndsAt?: Date | null
      currentPeriodEnd?: Date | null
    } & DefaultSession['user']
  }

  interface User {
    subscriptionTier?: string | null
    subscriptionStatus?: string | null
    trialEndsAt?: Date | null
    currentPeriodEnd?: Date | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string
    subscriptionTier?: string | null
    subscriptionStatus?: string | null
  }
}