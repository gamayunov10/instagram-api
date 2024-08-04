import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../base/enums/node-env.enum';

@Injectable()
export class UsersQueryRepository {
  private readonly logger = new Logger(UsersQueryRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}

  async findUserById(id: string) {
    try {
      return this.prismaClient.user.findUnique({
        where: { id },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async getTotalCountUsers() {
    try {
      return this.prismaClient.user.findMany();
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return null;
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findUserByEmail(email: string) {
    try {
      return this.prismaClient.user.findFirst({
        where: { email },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findUserByUsername(username: string) {
    try {
      return this.prismaClient.user.findFirst({
        where: { username },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findUserProviderInfo(userId: string) {
    try {
      return this.prismaClient.userProviderInfo.findMany({
        where: { userId: userId },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findPasswordRecoveryRecord(code: string) {
    try {
      return this.prismaClient.passwordRecoveryCode.findFirst({
        where: { recoveryCode: code },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async getUserWithRelations(email: string) {
    try {
      return await this.prismaClient.user.findFirst({
        where: { email },
        include: {
          confirmationCode: true,
          passwordRecoveryCode: true,
          device: true,
        },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async getUserByEndDate(today: Date) {
    try {
      return await this.prismaClient.user.findMany({
        where: {
          endDateOfSubscription: {
            lt: today,
          },
        },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return null;
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findUserByEmailConfirmationCode(confirmationCode: string) {
    try {
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
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }
}
