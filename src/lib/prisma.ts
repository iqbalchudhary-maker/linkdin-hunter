import { PrismaClient } from "@prisma/client";

// Ye check karta hai ke global level par prisma pehle se toh nahi bana hua
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"], // Is se aapko terminal mein SQL nazar aati rahegi
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;