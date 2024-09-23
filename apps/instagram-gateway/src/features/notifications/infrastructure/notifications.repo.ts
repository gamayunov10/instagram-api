import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../base/enums/node-env.enum';

@Injectable()
export class NotificationsRepository {
  private readonly logger = new Logger(NotificationsRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}
  async createNotification(userId: string, message: string) {
    try {
      return this.prismaClient.notification.create({
        data: { userId: userId, message },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    }
  }
  async markNotificationsAsRead(
    userId: string,
    ids: string[],
  ): Promise<boolean> {
    try {
      const res = await this.prismaClient.notification.updateMany({
        where: {
          userId,
          id: {
            in: ids,
          },
        },
        data: { isRead: true },
      });

      return res.count > 0;
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return false;
    }
  }
}
