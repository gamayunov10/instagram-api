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

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prismaClient.user.findFirst({
      where: { email },
    });
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.prismaClient.user.findFirst({
      where: { username },
    });
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
