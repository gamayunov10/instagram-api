import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

import { User } from '../entities/user.entity';

@Injectable()
export class UsersQueryRepository {
  private readonly logger = new Logger(UsersQueryRepository.name);
  constructor(
    private readonly configService: ConfigService,
    private prismaClient: PrismaClient,
  ) {}

  async findUserById(id: string) {
    return this.prismaClient.user.findUnique({
      where: { id },
    });
  }

  async findUserByEmail(email: string) {
    return this.prismaClient.user.findUnique({
      where: { email },
    });
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.prismaClient.user.findUnique({
      where: { username },
    });
  }

  async findUserProviderInfo(userId: string): Promise<User | null> {
    return this.prismaClient.userProviderInfo.findMany({
      where: { userId: userId },
    });
  }

  async getUserWithRelations(email: string) {
    return (await this.prismaClient.user.findFirst({
      where: { email },
      include: {
        confirmationCode: true,
      },
    })) as User & {
      confirmationCode: {
        confirmationCode: string;
      } | null;
    };
  }

  async findUserByEmailConfirmationCode(confirmationCode: string) {
    return this.prismaClient.user.findFirst({
      where: {
        confirmationCode: {
          confirmationCode: confirmationCode,
        },
      },
      include: {
        confirmationCode: true,
      },
    });
  }
}
