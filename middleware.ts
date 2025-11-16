// middleware.ts
// Protect routes that require authentication

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // You can add custom logic here
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token }) {
        // Return true if user is authenticated
        return !!token
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
)

// Protect these routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/notes/:path*',
    '/api/tasks/:path*',
    '/api/pages/:path*',
    '/api/user/:path*',
  ],
}