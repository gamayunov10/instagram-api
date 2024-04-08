import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { UserAuthInputModel } from '../../auth/models/input/user-auth.input.model';
import { NodeEnv } from '../../../base/enums/node-env.enum';
import { UserOauthCredInputModel } from '../../auth/models/input/user-oauth-cred.input.model';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(
    userAuthInputModel: UserAuthInputModel,
    hash: string,
    confirmationCode: string,
  ): Promise<string> {
    return await this.prismaClient.$transaction(async (prisma) => {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 1);

      const user = await prisma.user.create({
        data: {
          username: userAuthInputModel.username,
          passwordHash: hash,
          email: userAuthInputModel.email,
        },
        select: {
          id: true,
        },
      });

      const userId = user.id;

      await prisma.confirmationCode.create({
        data: { userId, confirmationCode, expirationDate },
      });

      return userId;
    });
  }

  async confirmUser(id: string): Promise<boolean> {
    try {
      const result = await this.prismaClient.$transaction(async (prisma) => {
        const updateUser = await prisma.user.update({
          where: { id },
          data: { isConfirmed: true },
        });

        const deleteConfirmation = await prisma.confirmationCode.delete({
          where: { userId: id },
        });

        return { updateUser, deleteConfirmation };
      });

      return !!(result.updateUser && result.deleteConfirmation);
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    }
  }

  async updateUserProviderInfo(
    details: UserOauthCredInputModel,
    id: string,
    userId: string,
  ): Promise<void> {
    try {
      await this.prismaClient.$transaction(async (prisma) => {
        await prisma.userProviderInfo.update({
          where: {
            id: id,
            provider: details.provider,
          },
          data: {
            provider: details.provider,
            userProviderId: details.userProviderId,
            userId: userId,
            displayName: details.displayName,
            email: details.email,
            city: details?.city ?? null,
          },
        });
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    }
  }

  async createUserByOAuth(details: UserOauthCredInputModel): Promise<User> {
    try {
      return await this.prismaClient.$transaction(async (prisma) => {
        const createdUser = await prisma.user.create({
          data: {
            email: details.email,
            username: details.displayName,
            passwordHash: null,
            isConfirmed: true,
          },
        });

        await prisma.userProviderInfo.create({
          data: {
            provider: details.provider,
            userProviderId: details.userProviderId,
            userId: createdUser.id,
            displayName: details.displayName,
            email: details.email,
            city: details?.city ?? null,
          },
        });

        return createdUser;
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    }
  }

  async mergeUserProviderInfo(
    details: UserOauthCredInputModel,
    userId: string,
  ): Promise<void> {
    try {
      await this.prismaClient.$transaction(async (prisma) => {
        await prisma.userProviderInfo.create({
          data: {
            provider: details.provider,
            userProviderId: details.userProviderId,
            userId: userId,
            displayName: details.displayName,
            email: details.email,
            city: details?.city ?? null,
          },
        });
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    }
  }

  async createPasswordRecoveryRecord(id: string, recoveryCode: string) {
    try {
      return await this.prismaClient.$transaction(async (prisma) => {
        const createdRecord = await prisma.passwordRecoveryCode.create({
          data: {
            userId: id,
            recoveryCode: recoveryCode,
          },
          select: {
            id: true,
          },
        });

        return createdRecord.id;
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }

      return false;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    return await this.prismaClient.$transaction(async (prisma) => {
      await prisma.user.delete({
        where: { id: userId },
      });
    });
  }
}
