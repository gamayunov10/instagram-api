import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../base/enums/node-env.enum';
import { SubscriptionTime } from '../../../../../../libs/common/base/ts/enums/subscription-time.enum';

@Injectable()
export class SubscriptionsQueryRepository {
  private readonly logger = new Logger(SubscriptionsQueryRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}

  async findAvailableSubscription(type: SubscriptionTime) {
    try {
      return await this.prismaClient.subscriptions.findFirst({
        where: { availability: true, subscriptionTimeType: type },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findOrderByPaymentId(paymentId: string) {
    try {
      return await this.prismaClient.subscriptionOrder.findFirst({
        where: { paymentId },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }
}
