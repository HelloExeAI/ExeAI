// app/api/tasks/route.ts
// Tasks API - GET all tasks, POST new task (WITH REAL AUTH)

import { NextRequest, NextResponse } from 'next/server'
import { createTask, getUserTasks, getTodayTasks, getOverdueTasks, getUpcomingTasks } from '@/lib/db/tasks'
import { getCurrentUserId } from '@/lib/auth-options'

// GET - Get tasks with filters
export async function GET(request: NextRequest) {
  try {
    // Get REAL userId from session
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    


    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') // today, overdue, upcoming, all
    const completed = searchParams.get('completed')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')

    let tasks

    switch (filter) {
      case 'today':
        tasks = await getTodayTasks(userId)
        break
      case 'overdue':
        tasks = await getOverdueTasks(userId)
        break
      case 'upcoming':
        tasks = await getUpcomingTasks(userId)
        break
      default:
        tasks = await getUserTasks(userId, {
          completed: completed ? completed === 'true' : undefined,
          type: type || undefined,
          priority: priority || undefined,
        })
    }

    return NextResponse.json({ success: true, tasks })
  } catch (error) {
    console.error('GET /api/tasks error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST - Create new task
export async function POST(request: NextRequest) {
  try {
    // Get REAL userId from session
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      priority,
      dueDate,
      dueTime,
      reminder,
      metadata,
      dailyNoteId,
    } = body

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      )
    }

    const task = await createTask({
      user: { connect: { id: userId } },
      title,
      description,
      type: type || 'task',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      dueTime,
      reminder: reminder ? new Date(reminder) : undefined,
      metadata,
      dailyNote: dailyNoteId ? { connect: { id: dailyNoteId } } : undefined,
    })

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('POST /api/tasks error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    )
  }
}