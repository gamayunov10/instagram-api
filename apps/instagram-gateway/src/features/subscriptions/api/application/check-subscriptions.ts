import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repo';
import { SubscriptionsService } from '../subscriptions.service';
import { UsersRepository } from '../../../users/infrastructure/users.repo';
import { AccountType } from '../../../../../../../libs/common/base/ts/enums/account-type.enum';

@Injectable()
export class CheckSubscriptions {
  private readonly logger = new Logger(CheckSubscriptions.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  @Cron('0 * * * *') // every hour at the 0th minute
  async checkSubscriptionsFromDB() {
    this.logger.log('Cron job started for checking subscriptions.');

    try {
      const today = new Date();

      const subscriptions =
        await this.usersQueryRepository.getUserByEndDate(today);

      if (subscriptions && subscriptions.length > 0) {
        for (const subscription of subscriptions) {
          await this.subscriptionsService.sendMessageAboutEndSubscription(
            subscription.username,
            subscription.email,
            subscription.endDateOfSubscription,
          );

          await this.usersRepository.updateAccountType(
            subscription.id,
            AccountType.PERSONAL,
            subscription.endDateOfSubscription,
            false,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'An error occurred while checking subscriptions',
        error.stack,
      );
    }

    this.logger.log('Cron job completed.');
  }
}
