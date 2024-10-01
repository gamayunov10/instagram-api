import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { SocketGatewayService } from '../../../socket/socket.gateway.service';
import { NotificationsRepository } from '../../infrastructure/notifications.repo';
import { NotificationsQueryRepository } from '../../infrastructure/notifications.query.repo';
import { NotificationQueryModel } from '../../models/notification.query.model';
import { Paginator } from '../../../../base/pagination/paginator';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import { IsUUID } from 'class-validator';

@Injectable()
export class NotificationsService {
	constructor(
		private socketGatewayService: SocketGatewayService,
		private notificationsRepo: NotificationsRepository,
		private notificationsQueryRepo: NotificationsQueryRepository,
	) { }

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
		for (let i = 0; i < ids.length; i++) {
			if (!ids[i].match(/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)) {
				throw new NotFoundException('404')
			}
		}
		const findAllNotificationByIds = await this.notificationsQueryRepo.findNotificationsByIds(ids)

		for (let i = 0; i < findAllNotificationByIds.length; i++) {
			if (!findAllNotificationByIds[i].id) {
				return {
					data: false,
					code: ResultCode.NotFound,
				}
			} else
				if (findAllNotificationByIds[i].userId !== userId) {
					return {
						data: false,
						code: ResultCode.Forbidden,
					}
				}
		}

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
