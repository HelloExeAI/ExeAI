// lib/db/pages.ts
// Wiki-style Pages database operations

import prisma from '../prisma'
import { Prisma } from '@prisma/client'

/**
 * Create new page
 */
export async function createPage(
  userId: string,
  title: string,
  content: string,
  tags?: string[]
) {
  try {
    return await prisma.page.create({
      data: {
        userId,
        title,
        content,
        tags: tags || [],
        linkedPages: [],
      },
    })
  } catch (error) {
    console.error('Error creating page:', error)
    throw error
  }
}

/**
 * Get page by title
 */
export async function getPageByTitle(userId: string, title: string) {
  try {
    return await prisma.page.findFirst({
      where: {
        userId,
        title: {
          equals: title,
          mode: 'insensitive',
        },
      },
    })
  } catch (error) {
    console.error('Error getting page by title:', error)
    throw error
  }
}

/**
 * Get page by ID
 */
export async function getPageById(userId: string, pageId: string) {
  try {
    return await prisma.page.findFirst({
      where: {
        id: pageId,
        userId,
      },
    })
  } catch (error) {
    console.error('Error getting page by ID:', error)
    throw error
  }
}

/**
 * Get all pages for user
 */
export async function getUserPages(
  userId: string,
  options?: {
    skip?: number
    take?: number
    tags?: string[]
  }
) {
  try {
    const where: Prisma.PageWhereInput = {
      userId,
    }

    if (options?.tags && options.tags.length > 0) {
      where.tags = {
        hasSome: options.tags,
      }
    }

    return await prisma.page.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      skip: options?.skip || 0,
      take: options?.take || 50,
    })
  } catch (error) {
    console.error('Error getting user pages:', error)
    throw error
  }
}

/**
 * Search pages by title or content
 */
export async function searchPages(userId: string, searchTerm: string) {
  try {
    return await prisma.page.findMany({
      where: {
        userId,
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
    })
  } catch (error) {
    console.error('Error searching pages:', error)
    throw error
  }
}

/**
 * Update page
 */
export async function updatePage(
  userId: string,
  pageId: string,
  data: {
    title?: string
    content?: string
    tags?: string[]
    linkedPages?: string[]
  }
) {
  try {
    // Verify ownership
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        userId,
      },
    })

    if (!page) {
      throw new Error('Page not found or unauthorized')
    }

    return await prisma.page.update({
      where: {
        id: pageId,
      },
      data,
    })
  } catch (error) {
    console.error('Error updating page:', error)
    throw error
  }
}

/**
 * Delete page
 */
export async function deletePage(userId: string, pageId: string) {
  try {
    // Verify ownership
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        userId,
      },
    })

    if (!page) {
      throw new Error('Page not found or unauthorized')
    }

    return await prisma.page.delete({
      where: {
        id: pageId,
      },
    })
  } catch (error) {
    console.error('Error deleting page:', error)
    throw error
  }
}

/**
 * Get pages that link to a specific page (backlinks)
 */
export async function getBacklinks(userId: string, pageId: string) {
  try {
    return await prisma.page.findMany({
      where: {
        userId,
        linkedPages: {
          has: pageId,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
  } catch (error) {
    console.error('Error getting backlinks:', error)
    throw error
  }
}

/**
 * Add link between pages
 */
export async function addPageLink(
  userId: string,
  sourcePageId: string,
  targetPageId: string
) {
  try {
    const page = await prisma.page.findFirst({
      where: {
        id: sourcePageId,
        userId,
      },
    })

    if (!page) {
      throw new Error('Page not found or unauthorized')
    }

    // Add to linkedPages if not already there
    if (!page.linkedPages.includes(targetPageId)) {
      return await prisma.page.update({
        where: {
          id: sourcePageId,
        },
        data: {
          linkedPages: {
            push: targetPageId,
          },
        },
      })
    }

    return page
  } catch (error) {
    console.error('Error adding page link:', error)
    throw error
  }
}

/**
 * Get all unique tags
 */
export async function getAllTags(userId: string) {
  try {
    const pages = await prisma.page.findMany({
      where: { userId },
      select: { tags: true },
    })

    const allTags = new Set<string>()
    pages.forEach(page => {
      page.tags.forEach(tag => allTags.add(tag))
    })

    return Array.from(allTags).sort()
  } catch (error) {
    console.error('Error getting all tags:', error)
    throw error
  }
}