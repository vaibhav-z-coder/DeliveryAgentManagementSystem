import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export async function connectPrisma(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✓ PostgreSQL connected via Prisma');
  } catch (error) {
    console.error('✗ Failed to connect to PostgreSQL:', error);
    throw error;
  }
}
