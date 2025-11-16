// app/api/tasks/[id]/route.ts
// Tasks API - GET, PATCH, DELETE specific task

import { NextRequest, NextResponse } from 'next/server'
import { getTaskById, updateTask, deleteTask } from '@/lib/db/tasks'

// GET - Get specific task by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Get userId from session
    const userId = 'mock-user-id'
    const { id } = await params

    const task = await getTaskById(userId, id)

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('GET /api/tasks/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

// PATCH - Update specific task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Get userId from session
    const userId = 'mock-user-id'
    const { id } = await params

    const body = await request.json()
    const {
      title,
      description,
      type,
      completed,
      priority,
      dueDate,
      dueTime,
      reminder,
      metadata,
    } = body

    const updateData: any = {}

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (completed !== undefined) {
      updateData.completed = completed
      updateData.completedAt = completed ? new Date() : null
    }
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (dueTime !== undefined) updateData.dueTime = dueTime
    if (reminder !== undefined) updateData.reminder = reminder ? new Date(reminder) : null
    if (metadata !== undefined) updateData.metadata = metadata

    const task = await updateTask(userId, id, updateData)

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('PATCH /api/tasks/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE - Delete specific task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Get userId from session
    const userId = 'mock-user-id'
    const { id } = await params

    await deleteTask(userId, id)

    return NextResponse.json({ success: true, message: 'Task deleted' })
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}