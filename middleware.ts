// middleware.ts
// Protect routes that require authentication

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Allow access to authenticated users
    if (token) {
      return NextResponse.next()
    }

    // Redirect unauthenticated users to sign-in
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  },
  {
    callbacks: {
      authorized({ token }) {
        // Return true if user has a valid token
        return !!token
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

// Protect these routes - requires authentication
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/notes/:path*',
    '/api/tasks/:path*',
    '/api/pages/:path*',
    '/api/expenses/:path*',
    '/api/travel/:path*',
    '/api/shopping/:path*',
    '/api/daily-note/:path*',
    '/api/calendar-events/:path*',
    '/api/user/:path*',
  ],
}