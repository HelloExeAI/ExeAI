// app/api/tasks/toggle/route.ts
// Toggle task completion status

import { NextRequest, NextResponse } from 'next/server'
import { updateTask } from '@/lib/db/tasks'

export async function POST(
  request: NextRequest
) {
  try {
    // TODO: Get userId from session
    const userId = 'mock-user-id'

    const body = await request.json()
    const { taskId, completed } = body

    if (!taskId || typeof completed !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const task = await updateTask(userId, taskId, {
      completed,
      completedAt: completed ? new Date() : null,
    })

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('POST /api/tasks/toggle error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle task' },
      { status: 500 }
    )
  }
}

