import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { PaymentType } from '../../../../../../../libs/common/base/ts/enums/payment-type.enum';
import { NodeEnv } from '../../../../base/enums/node-env.enum';

@Injectable()
export class SubscribersRepository {
  private readonly logger = new Logger(SubscribersRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}
  async createSubscriber(
    userId: string,
    customerId: string,
    subscriptionId: string,
    startDate: Date,
    endDate: Date,
    paymentSystem: PaymentType,
  ) {
    try {
      const result = await this.prismaClient.subscriber.create({
        data: {
          userId: userId,
          customerId: customerId,
          subscriptionId: subscriptionId,
          startDate: startDate,
          endDate: endDate,
          paymentSystem: paymentSystem,
        },
      });

      return !!result;
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }

      return false;
    } finally {
      await this.prismaClient.$disconnect();
    }
  }
}
