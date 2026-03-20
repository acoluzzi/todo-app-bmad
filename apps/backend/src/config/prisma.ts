import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client.js";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
let prisma: PrismaClient | undefined;
let developmentClientReferences = 0;
let productionClientReferences = 0;

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
    developmentClientReferences += 1;
    return globalForPrisma.prisma;
  }

  if (!prisma) {
    prisma = createPrismaClient();
  }
  productionClientReferences += 1;
  return prisma;
};

export const disconnectPrisma = async (): Promise<void> => {
  if (process.env.NODE_ENV !== "production") {
    if (developmentClientReferences > 0) {
      developmentClientReferences -= 1;
    }

    if (developmentClientReferences === 0 && globalForPrisma.prisma) {
      await globalForPrisma.prisma.$disconnect();
      globalForPrisma.prisma = undefined;
    }
    return;
  }

  if (productionClientReferences > 0) {
    productionClientReferences -= 1;
  }

  if (productionClientReferences === 0 && prisma) {
    await prisma.$disconnect();
    prisma = undefined;
  }
};
