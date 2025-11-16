// app/api/pages/search/route.ts
// Pages API - Search pages by title or content

import { NextRequest, NextResponse } from 'next/server'
import { searchPages } from '@/lib/db/pages'

// POST - Search pages
export async function POST(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'mock-user-id'

    const body = await request.json()
    const { query } = body

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      )
    }

    const pages = await searchPages(userId, query)

    return NextResponse.json({ success: true, pages, count: pages.length })
  } catch (error) {
    console.error('POST /api/pages/search error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search pages' },
      { status: 500 }
    )
  }
}