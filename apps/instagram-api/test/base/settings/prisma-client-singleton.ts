import { PrismaClient } from '@prisma/client';

class PrismaClientSingleton {
  private prisma: PrismaClient;
  private static instance: PrismaClientSingleton;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): PrismaClientSingleton {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClientSingleton();
    }

    return PrismaClientSingleton.instance;
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
  }
}

export const prismaClientSingleton = PrismaClientSingleton.getInstance();
