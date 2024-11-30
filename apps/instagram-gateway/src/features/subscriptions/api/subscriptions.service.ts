import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import { SubscriptionsQueryRepository } from '../infrastructure/subscriptions.query.repo';
import { SubscriptionTime } from '../../../../../../libs/common/base/ts/enums/subscription-time.enum';
import { AccountType } from '../../../../../../libs/common/base/ts/enums/account-type.enum';
import { UsersRepository } from '../../users/infrastructure/users.repo';
import { SendSuccessSubscriptionCommand } from '../../notifications/api/application/use-cases/send-success-subscription-message.use-case';
import { NodeEnv } from '../../../base/enums/node-env.enum';
import { UsersQueryRepository } from '../../users/infrastructure/users.query.repo';
import { SendSuccessAutoRenewalSubscriptionCommand } from '../../notifications/api/application/use-cases/send-success-auto-renewal-message.use-case';
import { SendMessageAboutEndSubscriptionCommand } from '../../notifications/api/application/use-cases/send-message-about-end-subscription.use-case';
import { NotificationsService } from '../../notifications/api/application/notifications.service';
import { messageSuccessfulSubscription } from '../../../base/constants/constants';
import { PaginationInputPayments } from '../../../resolvers/payments/models/pagination-payments-input';
import { PaginatedPaymentsModel } from '../../../resolvers/payments/models/paginated-payments.model';
import { Paginator } from '../../../base/pagination/paginator';
import { PaymentType } from '../../../../../../libs/common/base/ts/enums/payment-type.enum';
import { SubscriptionPaymentsModel } from '../../../resolvers/payments/models/subscription.payments.model';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly subscriptionsQueryRepo: SubscriptionsQueryRepository,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
  ) {}
  async getAllPayments(
    pagination: PaginationInputPayments,
  ): Promise<PaginatedPaymentsModel> {
    const result = await this.subscriptionsQueryRepo.getAllPayments(pagination);
    return this.processPayments(
      result.payments,
      pagination.page,
      pagination.pageSize,
      result.totalCount,
    );
  }

  async getAllPaymentsByUser(
    userId: string,
    pagination: PaginationInputPayments,
  ): Promise<PaginatedPaymentsModel> {
    const result = await this.subscriptionsQueryRepo.getAllPaymentsByUser(
      userId,
      pagination,
    );
    return this.processPayments(
      result.payments,
      pagination.page,
      pagination.pageSize,
      result.totalCount,
    );
  }
  private async processPayments(
    payments: any[],
    pageNumber: number,
    pageSize: number,
    totalCount: number,
  ): Promise<PaginatedPaymentsModel> {
    if (payments.length === 0) {
      return Paginator.paginate({
        pageNumber,
        pageSize,
        totalCount,
        items: [],
      });
    }

    const items: SubscriptionPaymentsModel[] = await Promise.all(
      payments.map(async (p) => {
        const endDateOfSubscription = await this.endDateOfSubscription(
          p.price,
          p.subscriptionTime,
          p.payment.updatedAt,
        );

        return {
          id: p.id,
          userId: p.userId,
          userName: p.user.username,
          endDate: endDateOfSubscription,
          createdAt: p.createdAt,
          currency: 'USD',
          amount: p.price,
          type: p.subscriptionTime as SubscriptionTime,
          paymentMethod: p.payment.paymentSystem as PaymentType,
        };
      }),
    );

    return Paginator.paginate({
      pageNumber,
      pageSize,
      totalCount,
      items,
    });
  }
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
  async scheduleSubscriptionNotification(
    userId: string,
    price: number,
    subscriptionTime: string,
  ) {
    const user = await this.usersQueryRepository.findUserById(userId);

    const endDate = await this.endDateOfSubscription(
      price,
      subscriptionTime,
      user.endDateOfSubscription,
    );

    const message = `${messageSuccessfulSubscription} ${endDate.toLocaleDateString()}`;
    await this.notificationsService.createNotification(userId, message);
  }
}
