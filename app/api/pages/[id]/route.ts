// app/api/pages/[id]/route.ts
// Pages API - GET, PATCH, DELETE specific page

import { NextRequest, NextResponse } from 'next/server'
import { getPageById, updatePage, deletePage } from '@/lib/db/pages'

// GET - Get specific page by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get userId from session
    const userId = 'mock-user-id'

    const page = await getPageById(userId, params.id)

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, page })
  } catch (error) {
    console.error('GET /api/pages/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page' },
      { status: 500 }
    )
  }
}

// PATCH - Update specific page
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get userId from session
    const userId = 'mock-user-id'

    const body = await request.json()
    const { title, content, tags, linkedPages } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (tags !== undefined) updateData.tags = tags
    if (linkedPages !== undefined) updateData.linkedPages = linkedPages

    const page = await updatePage(userId, params.id, updateData)

    return NextResponse.json({ success: true, page })
  } catch (error) {
    console.error('PATCH /api/pages/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update page' },
      { status: 500 }
    )
  }
}

// DELETE - Delete specific page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Get userId from session
    const userId = 'mock-user-id'

    await deletePage(userId, params.id)

    return NextResponse.json({ success: true, message: 'Page deleted' })
  } catch (error) {
    console.error('DELETE /api/pages/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete page' },
      { status: 500 }
    )
  }
}