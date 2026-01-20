// lib/db/notes.ts
// Daily Notes database operations

import prisma from '../prisma'
import { Prisma } from '@prisma/client'

/**
 * Get daily note by date
 */
export async function getDailyNote(userId: string, date: Date) {
  try {
    // Normalize date to start of day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    return await prisma.dailyNote.findFirst({
      where: {
        userId,
        date: startOfDay,
      },
      include: {
        tasks: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })
  } catch (error) {
    console.error('Error getting daily note:', error)
    throw error
  }
}

/**
 * Create or update daily note
 */
export async function upsertDailyNote(
  userId: string,
  date: Date,
  content: string,
  metadata?: any
) {
  try {
    // Normalize date to start of day
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    return await prisma.dailyNote.upsert({
      where: {
        userId_date: {
          userId,
          date: startOfDay,
        }
      },
      update: {
        content,
        metadata,
        updatedAt: new Date(),
      },
      create: {
        userId,
        date: startOfDay,
        content,
        metadata,
      },
    })
  } catch (error) {
    console.error('Error upserting daily note:', error)
    throw error
  }
}

/**
 * Get all daily notes for a user (paginated)
 */
export async function getUserDailyNotes(
  userId: string,
  options?: {
    skip?: number
    take?: number
    startDate?: Date
    endDate?: Date
  }
) {
  try {
    const where: Prisma.DailyNoteWhereInput = {
      userId,
    }

    if (options?.startDate || options?.endDate) {
      where.date = {}
      if (options.startDate) {
        where.date.gte = options.startDate
      }
      if (options.endDate) {
        where.date.lte = options.endDate
      }
    }

    return await prisma.dailyNote.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
      skip: options?.skip || 0,
      take: options?.take || 30,
      include: {
        tasks: {
          where: {
            completed: false,
          },
        },
      },
    })
  } catch (error) {
    console.error('Error getting user daily notes:', error)
    throw error
  }
}

/**
 * Search daily notes by content
 */
export async function searchDailyNotes(userId: string, searchTerm: string) {
  try {
    return await prisma.dailyNote.findMany({
      where: {
        userId,
        content: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 20,
    })
  } catch (error) {
    console.error('Error searching daily notes:', error)
    throw error
  }
}

/**
 * Delete daily note
 */
export async function deleteDailyNote(userId: string, noteId: string) {
  try {
    // Verify ownership before deleting
    const note = await prisma.dailyNote.findFirst({
      where: {
        id: noteId,
        userId,
      },
    })

    if (!note) {
      throw new Error('Note not found or unauthorized')
    }

    return await prisma.dailyNote.delete({
      where: {
        id: noteId,
      },
    })
  } catch (error) {
    console.error('Error deleting daily note:', error)
    throw error
  }
}

/**
 * Get daily note statistics
 */
export async function getDailyNoteStats(userId: string) {
  try {
    const totalNotes = await prisma.dailyNote.count({
      where: { userId },
    })

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const notesThisMonth = await prisma.dailyNote.count({
      where: {
        userId,
        date: {
          gte: thisMonth,
        },
      },
    })

    return {
      totalNotes,
      notesThisMonth,
    }
  } catch (error) {
    console.error('Error getting daily note stats:', error)
    throw error
  }
}