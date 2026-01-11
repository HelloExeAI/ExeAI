// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Debug: Log the database URL being used (masked)
const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  const maskedv = dbUrl.replace(/:[^:@]+@/, ':***@');
  console.log('🔌 Prisma Client initializing with URL:', maskedv);
} else {
  console.error('❌ Prisma Client initializing: DATABASE_URL is missing!');
}

// Cache Prisma Client in globalThis to prevent multiple instances in all environments
globalForPrisma.prisma = prisma;

// Ensure connection is established (lazy connection)
// Prisma connects automatically on first query, but we can pre-connect
if (process.env.NODE_ENV === 'development') {
  prisma.$connect().catch((error) => {
    console.error('⚠️  Failed to pre-connect to database:', error);
    console.error('   Connection will be established on first query');
  });
}

export default prisma;