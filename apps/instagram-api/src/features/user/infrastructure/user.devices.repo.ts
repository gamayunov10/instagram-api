import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../base/enums/node-env.enum';

@Injectable()
export class UserDevicesRepository {
  private readonly logger = new Logger(UserDevicesRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}

  async createDevice(
    decodedToken: any,
    ip: string,
    userAgent: string,
  ): Promise<string> {
    try {
      const iatDate = new Date(decodedToken.iat * 1000);
      const expDate = new Date(decodedToken.exp * 1000);

      return await this.prismaClient.$transaction(async (prisma) => {
        const result = await prisma.deviceAuthSession.create({
          data: {
            deviceId: decodedToken.deviceId,
            ip: ip,
            title: userAgent,
            lastActiveDate: iatDate,
            expirationDate: expDate,
            userId: decodedToken.userId,
          },
          select: {
            id: true,
          },
        });

        return result.id;
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    }
  }

  async deleteUserSessions(userId: string): Promise<void> {
    try {
      return await this.prismaClient.$transaction(async (prisma) => {
        await prisma.deviceAuthSession.deleteMany({
          where: {
            userId: userId,
          },
        });
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    }
  }
}
