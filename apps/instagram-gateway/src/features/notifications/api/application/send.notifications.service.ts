import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repo';
import { SubscriptionsService } from '../../../subscriptions/api/subscriptions.service';
import {
  messageForOneDay,
  messageForSevenDay,
} from '../../../../base/constants/constants';

import { NotificationsService } from './notifications.service';

@Injectable()
export class SendNotificationsService {
  private readonly logger = new Logger(SendNotificationsService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('0 7 * * *') // every day
  async sendNotificationsService() {
    this.logger.log('Cron SendNotificationsService job started');

    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const weekFromNow = new Date(today);
      weekFromNow.setDate(today.getDate() + 7);

      const expiringTomorrow =
        await this.usersQueryRepository.getSubscriptionsExpiringOn(tomorrow);
      if (expiringTomorrow.length > 0) {
        for (const user of expiringTomorrow) {
          await this.notificationsService.createNotification(
            user.id,
            messageForOneDay,
          );
        }
      }

      const expiringInWeek =
        await this.usersQueryRepository.getSubscriptionsExpiringOn(weekFromNow);
      if (expiringInWeek.length > 0) {
        for (const user of expiringInWeek) {
          await this.notificationsService.createNotification(
            user.id,
            messageForSevenDay,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'An error occurred while checking subscriptions',
        error.stack,
      );
    }

    this.logger.log('Cron SendNotificationsService job completed.');
  }
}
