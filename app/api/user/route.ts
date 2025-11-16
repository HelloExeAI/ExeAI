// app/api/user/route.ts
// User API - GET profile, PATCH update profile

import { NextRequest, NextResponse } from 'next/server'
import { getUserById, updateUser } from '@/lib/db/users'

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'mock-user-id'

    const user = await getUserById(userId)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    console.error('GET /api/user error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    // TODO: Get userId from session
    const userId = 'mock-user-id'

    const body = await request.json()
    const { name, email, image } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (image !== undefined) updateData.image = image

    const user = await updateUser(userId, updateData)

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({ success: true, user: userWithoutPassword })
  } catch (error) {
    console.error('PATCH /api/user error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}