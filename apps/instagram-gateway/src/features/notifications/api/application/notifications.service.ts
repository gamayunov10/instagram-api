import { Injectable } from '@nestjs/common';

import { SocketGatewayService } from '../../../socket/socket.gateway.service';
import { NotificationsRepository } from '../../infrastructure/notifications.repo';
import { NotificationsQueryRepository } from '../../infrastructure/notifications.query.repo';
import { NotificationQueryModel } from '../../models/notification.query.model';
import { Paginator } from '../../../../base/pagination/paginator';
import { ResultCode } from '../../../../base/enums/result-code.enum';

@Injectable()
export class NotificationsService {
  constructor(
    private socketGatewayService: SocketGatewayService,
    private notificationsRepo: NotificationsRepository,
    private notificationsQueryRepo: NotificationsQueryRepository,
  ) {}

  async createNotification(
    userId: string,
    message: string,
    delayInMs?: number,
  ) {
    const notification = await this.notificationsRepo.createNotification(
      userId,
      message,
    );

    // Sending a notification via WebSocket
    if (delayInMs && delayInMs > 0) {
      setTimeout(() => {
        this.socketGatewayService.sendNotificationToUser(userId, notification);
      }, delayInMs);
    } else {
      this.socketGatewayService.sendNotificationToUser(userId, notification);
    }

    return notification;
  }

  async getNotificationsByUserId(
    userId: string,
    query: NotificationQueryModel,
  ) {
    const items =
      await this.notificationsQueryRepo.findNotificationsByQueryAndUserId(
        userId,
        query,
      );

    return Paginator.paginate({
      pageNumber: Number(query.page),
      pageSize: Number(query.pageSize),
      totalCount: items.totalCount,
      items: items.notifications,
    });
  }

  async markNotificationsAsRead(userId: string, ids: string[]) {
	const findAllNotificationByIds = await this.notificationsQueryRepo.findAllNotifications(ids)
	if(!findAllNotificationByIds) {
		return {
			data: false,
       		code: ResultCode.NotFound,
		}
	}

	findAllNotificationByIds.forEach(function(item) {
			if(item.userId !== userId) {
				return {
				data: false,
				code: ResultCode.Forbidden,
			}
		}
	})

    const res = await this.notificationsRepo.markNotificationsAsRead(
	  userId,
      ids,
    );

    if (!res) {
      return {
        data: false,
        code: ResultCode.BadRequest,
      };
    }
    return {
      data: true,
      code: ResultCode.Success,
    };
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.notificationsQueryRepo.getUnreadNotificationCount(userId);
  }
}
