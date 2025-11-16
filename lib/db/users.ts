// lib/db/users.ts
// User database operations

import prisma from '../prisma'  
import { Prisma } from '@prisma/client'

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: true,
        sessions: true,
      },
    })
  } catch (error) {
    console.error('Error getting user by ID:', error)
    throw error
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email },
    })
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw error
  }
}

/**
 * Create new user
 */
export async function createUser(data: Prisma.UserCreateInput) {
  try {
    return await prisma.user.create({
      data,
    })
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Update user
 */
export async function updateUser(userId: string, data: Prisma.UserUpdateInput) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

/**
 * Update user subscription
 */
export async function updateUserSubscription(
  userId: string,
  subscriptionData: {
    subscriptionTier?: string
    subscriptionStatus?: string
    trialEndsAt?: Date
    currentPeriodEnd?: Date
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    stripePriceId?: string
  }
) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data: subscriptionData,
    })
  } catch (error) {
    console.error('Error updating user subscription:', error)
    throw error
  }
}

/**
 * Delete user and all related data
 */
export async function deleteUser(userId: string) {
  try {
    return await prisma.user.delete({
      where: { id: userId },
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

/**
 * Check if user is on active subscription
 */
export async function isUserSubscribed(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionStatus: true,
        currentPeriodEnd: true,
        trialEndsAt: true,
      },
    })

    if (!user) return false

    // Check if on active paid subscription
    if (user.subscriptionStatus === 'active' && user.currentPeriodEnd) {
      return new Date() < user.currentPeriodEnd
    }

    // Check if on valid trial
    if (user.subscriptionStatus === 'active' && user.trialEndsAt) {
      return new Date() < user.trialEndsAt
    }

    return false
  } catch (error) {
    console.error('Error checking user subscription:', error)
    return false
  }
}