// lib/db/index.ts
// Central export file for all database operations

// Re-export all user operations
export * from './users'

// Re-export all note operations
export * from './notes'

// Re-export all task operations
export * from './tasks'

// Re-export all page operations
export * from './pages'

// You can now import like:
// import { getUserById, createTask, getDailyNote } from '@/lib/db'