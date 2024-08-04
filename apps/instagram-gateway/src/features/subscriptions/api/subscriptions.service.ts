import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import { SubscriptionsQueryRepository } from '../infrastructure/subscriptions.query.repo';
import { SubscriptionTime } from '../../../../../../libs/common/base/ts/enums/subscription-time.enum';
import { AccountType } from '../../../../../../libs/common/base/ts/enums/account-type.enum';
import { UsersRepository } from '../../users/infrastructure/users.repo';
import { SendSuccessSubscriptionCommand } from '../../notifications/application/use-cases/send-success-subscription-message.use-case';
import { NodeEnv } from '../../../base/enums/node-env.enum';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repo';
import { SendSuccessAutoRenewalSubscriptionCommand } from '../../notifications/application/use-cases/send-success-auto-renewal-message.use-case';
import { SendMessageAboutEndSubscriptionCommand } from '../../notifications/application/use-cases/send-message-about-end-subscription.use-case';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly subscriptionsQueryRepo: SubscriptionsQueryRepository,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
  ) {}

  async endDateOfSubscription(
    price: number,
    subscriptionTime: string,
    currentSubscriptionDate: Date | null,
  ): Promise<Date> {
    const now = new Date();

    const product = await this.subscriptionsQueryRepo.findAvailableSubscription(
      subscriptionTime as SubscriptionTime,
    );

    const subTime = (subscriptionTime: string): number => {
      if (subscriptionTime === SubscriptionTime.DAY) {
        return 1;
      }

      if (subscriptionTime === SubscriptionTime.WEEKLY) {
        return 7;
      }

      if (subscriptionTime === SubscriptionTime.MONTHLY) {
        return 30;
      }
    };

    const quantity = price / product.price;

    const result = subTime(subscriptionTime) * quantity;

    function getDateFromDays(days: number): Date {
      if (currentSubscriptionDate) {
        return new Date(
          currentSubscriptionDate.getTime() + days * 24 * 60 * 60 * 1000,
        );
      } else {
        return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      }
    }

    return getDateFromDays(result);
  }

  async nextPaymentDateOfSubscription(
    subscriptionTime: string,
    endDateOfSubscription: Date,
  ): Promise<Date> {
    const subTime = (subscriptionTime: string): number => {
      if (subscriptionTime === SubscriptionTime.DAY) {
        return 1;
      }

      if (subscriptionTime === SubscriptionTime.WEEKLY) {
        return 7;
      }

      if (subscriptionTime === SubscriptionTime.MONTHLY) {
        return 30;
      }
    };

    const daysToAdd = subTime(subscriptionTime);

    const getDateFromDays = (days: number): Date => {
      return new Date(
        endDateOfSubscription.getTime() + days * 24 * 60 * 60 * 1000,
      );
    };

    return getDateFromDays(daysToAdd);
  }

  async updateAccountType(
    userId: string,
    accountType: AccountType,
    price: number,
    subscriptionTime: string,
    autoRenewal: boolean,
  ): Promise<void> {
    const user = await this.usersQueryRepository.findUserById(userId);

    const currentSubscriptionDate = user.endDateOfSubscription;

    const endDateOfSubscription = await this.endDateOfSubscription(
      price,
      subscriptionTime,
      currentSubscriptionDate,
    );

    await this.usersRepository.updateAccountType(
      userId,
      accountType,
      endDateOfSubscription,
      autoRenewal,
    );
  }

  async sendSubscriptionNotification(userId: string): Promise<void> {
    const user = await this.usersQueryRepository.findUserById(userId);

    try {
      await this.commandBus.execute(
        new SendSuccessSubscriptionCommand(user.username, user.email),
      );
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }

      await this.commandBus.execute(
        new SendSuccessSubscriptionCommand(user.username, user.email),
      );
    }
  }
  async sendNotificationsAboutAutomaticDebiting(
    userId: string,
    interval: string,
  ): Promise<void> {
    const user = await this.usersQueryRepository.findUserById(userId);

    try {
      await this.commandBus.execute(
        new SendSuccessAutoRenewalSubscriptionCommand(
          user.username,
          user.email,
          interval,
        ),
      );
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }

      await this.commandBus.execute(
        new SendSuccessAutoRenewalSubscriptionCommand(
          user.username,
          user.email,
          interval,
        ),
      );
    }
  }

  async sendMessageAboutEndSubscription(
    username: string,
    email: string,
    endDateOfSubscription: Date,
  ): Promise<void> {
    try {
      await this.commandBus.execute(
        new SendMessageAboutEndSubscriptionCommand(
          username,
          email,
          endDateOfSubscription,
        ),
      );
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }

      await this.commandBus.execute(
        new SendMessageAboutEndSubscriptionCommand(
          username,
          email,
          endDateOfSubscription,
        ),
      );
    }
  }
}
