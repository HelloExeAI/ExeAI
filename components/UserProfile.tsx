// components/UserProfile.tsx
// Example: Client-side component using NextAuth session

'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function UserProfile() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Loading state
  if (status === 'loading') {
    return <div className="animate-pulse bg-gray-200 h-12 w-48 rounded"></div>
  }

  // Not logged in
  if (!session) {
    return (
      <button
        onClick={() => router.push('/auth/signin')}
        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
      >
        Sign In
      </button>
    )
  }

  // Logged in
  return (
    <div className="flex items-center gap-4">
      {/* User avatar */}
      {session.user.image ? (
        <img
          src={session.user.image}
          alt={session.user.name || 'User'}
          className="w-10 h-10 rounded-full"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white font-semibold">
          {session.user.name?.[0] || session.user.email?.[0] || 'U'}
        </div>
      )}

      {/* User info */}
      <div className="flex flex-col">
        <span className="font-semibold text-sm">{session.user.name}</span>
        <span className="text-xs text-gray-500">
          {session.user.subscriptionTier || 'Free Trial'}
        </span>
      </div>

      {/* Sign out button */}
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:border-gray-400"
      >
        Sign Out
      </button>
    </div>
  )
}