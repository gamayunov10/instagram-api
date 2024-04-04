import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { UserAuthInputModel } from '../../auth/models/input/user-auth.input.model';
import { NodeEnv } from '../../../base/enums/node-env.enum';

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

  async deleteUser(userId: string): Promise<void> {
    return await this.prismaClient.$transaction(async (prisma) => {
      await prisma.user.delete({
        where: { id: userId },
      });
    });
  }
}
