import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { NodeEnv } from '../../../base/enums/node-env.enum';
import { NotificationQueryModel } from '../models/notification.query.model';
import { NotificationViewModel } from '../models/notification.view.model';

@Injectable()
export class NotificationsQueryRepository {
  private readonly logger = new Logger(NotificationsQueryRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}
  async findNotificationsByQueryAndUserId(
    userId: string,
    query: NotificationQueryModel,
  ) {
    try {
      const oneMonthAgo = new Date();

      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const result = await this.prismaClient.notification.findMany({
        where: {
          userId: userId,
          createdAt: {
            gte: oneMonthAgo, // Only notifications created in the last month
          },
        },
      });

      const totalCount = result.length;

      const skip = Number(query.pageSize) * (Number(query.page) - 1);

      const notifications: NotificationViewModel[] =
        await this.prismaClient.notification.findMany({
          where: {
            userId: userId,
            createdAt: {
              gte: oneMonthAgo, // Only notifications created in the last month
            },
          },
          orderBy: { [query.sortField]: query.sortDirection },
          skip: skip,
          take: Number(query.pageSize),
        });

      return {
        notifications,
        totalCount,
      };
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return { notifications: [], totalCount: 0 };
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      return this.prismaClient.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return 0;
    }
  }

  async findAllNotifications(ids: string[]) {
	try {
		return await this.prismaClient.notification.findMany({
			where: {
				id: {in: [...ids]}
			}
		})
	} catch(e) {
		if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
			this.logger.error(e);
		  }
		  return
	}
  }

  async findNotByUserId(userId: string):Promise<any> {
	try {
		await this.prismaClient.notification.findFirst({
			where: {
				user: {id: userId}
			}
		})
	} catch(e) {
		if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
			this.logger.error(e);
		  }
		  return
	}
  }
}
