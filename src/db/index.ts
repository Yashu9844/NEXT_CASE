import { PrismaClient } from '@prisma/client';

const createPrismaClient = () => {
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient();
  } else {
    if (!(globalThis as any).cachedPrisma) {
      (globalThis as any).cachedPrisma = new PrismaClient();
    }
    return (globalThis as any).cachedPrisma;
  }
};

export const db = createPrismaClient();
