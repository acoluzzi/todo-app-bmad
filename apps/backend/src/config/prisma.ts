import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client.js";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
let prisma: PrismaClient | undefined;

const createPrismaClient = (): PrismaClient => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL must be set to initialize Prisma client.");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
};

export const getPrismaClient = (): PrismaClient => {
  if (process.env.NODE_ENV !== "production") {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return globalForPrisma.prisma;
  }

  if (!prisma) {
    prisma = createPrismaClient();
  }
  return prisma;
};

export const disconnectPrisma = async (): Promise<void> => {
  if (process.env.NODE_ENV !== "production") {
    if (globalForPrisma.prisma) {
      await globalForPrisma.prisma.$disconnect();
      globalForPrisma.prisma = undefined;
    }
    return;
  }

  if (prisma) {
    await prisma.$disconnect();
    prisma = undefined;
  }
};
