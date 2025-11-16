// lib/db/tasks.ts
// Tasks database operations

import prisma from '../prisma'
import { Prisma } from '@prisma/client'

/**
 * Create new task
 */
export async function createTask(data: Prisma.TaskCreateInput) {
  try {
    return await prisma.task.create({
      data,
    })
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

/**
 * Get task by ID
 */
export async function getTaskById(userId: string, taskId: string) {
  try {
    return await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
      include: {
        dailyNote: true,
      },
    })
  } catch (error) {
    console.error('Error getting task:', error)
    throw error
  }
}

/**
 * Get all tasks for user
 */
export async function getUserTasks(
  userId: string,
  options?: {
    completed?: boolean
    type?: string
    priority?: string
    skip?: number
    take?: number
  }
) {
  try {
    const where: Prisma.TaskWhereInput = {
      userId,
    }

    if (options?.completed !== undefined) {
      where.completed = options.completed
    }

    if (options?.type) {
      where.type = options.type
    }

    if (options?.priority) {
      where.priority = options.priority
    }

    return await prisma.task.findMany({
      where,
      orderBy: [
        { completed: 'asc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      skip: options?.skip || 0,
      take: options?.take || 50,
    })
  } catch (error) {
    console.error('Error getting user tasks:', error)
    throw error
  }
}

/**
 * Get today's tasks
 */
export async function getTodayTasks(userId: string) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return await prisma.task.findMany({
      where: {
        userId,
        completed: false,
        OR: [
          {
            dueDate: {
              gte: today,
              lt: tomorrow,
            },
          },
          {
            dueDate: null,
            createdAt: {
              gte: today,
            },
          },
        ],
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    })
  } catch (error) {
    console.error('Error getting today tasks:', error)
    throw error
  }
}

/**
 * Get overdue tasks
 */
export async function getOverdueTasks(userId: string) {
  try {
    const now = new Date()

    return await prisma.task.findMany({
      where: {
        userId,
        completed: false,
        dueDate: {
          lt: now,
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    })
  } catch (error) {
    console.error('Error getting overdue tasks:', error)
    throw error
  }
}

/**
 * Get upcoming tasks (next 7 days)
 */
export async function getUpcomingTasks(userId: string) {
  try {
    const now = new Date()
    const sevenDaysLater = new Date()
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)

    return await prisma.task.findMany({
      where: {
        userId,
        completed: false,
        dueDate: {
          gte: now,
          lte: sevenDaysLater,
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    })
  } catch (error) {
    console.error('Error getting upcoming tasks:', error)
    throw error
  }
}

/**
 * Update task
 */
export async function updateTask(
  userId: string,
  taskId: string,
  data: Prisma.TaskUpdateInput
) {
  try {
    // Verify ownership
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    })

    if (!task) {
      throw new Error('Task not found or unauthorized')
    }

    return await prisma.task.update({
      where: {
        id: taskId,
      },
      data,
    })
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

/**
 * Toggle task completion
 */
export async function toggleTaskCompletion(userId: string, taskId: string) {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    })

    if (!task) {
      throw new Error('Task not found or unauthorized')
    }

    return await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null,
      },
    })
  } catch (error) {
    console.error('Error toggling task completion:', error)
    throw error
  }
}

/**
 * Delete task
 */
export async function deleteTask(userId: string, taskId: string) {
  try {
    // Verify ownership
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    })

    if (!task) {
      throw new Error('Task not found or unauthorized')
    }

    return await prisma.task.delete({
      where: {
        id: taskId,
      },
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

/**
 * Get task statistics
 */
export async function getTaskStats(userId: string) {
  try {
    const totalTasks = await prisma.task.count({
      where: { userId },
    })

    const completedTasks = await prisma.task.count({
      where: {
        userId,
        completed: true,
      },
    })

    const pendingTasks = await prisma.task.count({
      where: {
        userId,
        completed: false,
      },
    })

    const overdueTasks = await prisma.task.count({
      where: {
        userId,
        completed: false,
        dueDate: {
          lt: new Date(),
        },
      },
    })

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    }
  } catch (error) {
    console.error('Error getting task stats:', error)
    throw error
  }
}