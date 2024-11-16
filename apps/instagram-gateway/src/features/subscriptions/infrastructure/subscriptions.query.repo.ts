import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../base/enums/node-env.enum';
import { SubscriptionTime } from '../../../../../../libs/common/base/ts/enums/subscription-time.enum';
import { MyPaymentsQueryModel } from '../models/query/my-paymants.query.model';
import { PaymentStatus } from '../../../../../../libs/common/base/ts/enums/payment-status.enum';
import { SortDirection } from '../../../base/enums/sort/sort.direction.enum';
import { PaginationInputPayments } from '../../../resolvers/payments/models/pagination-payments-input';

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

  async getMyPayments(userId: string, query: MyPaymentsQueryModel) {
    try {
      const result = await this.prismaClient.subscriptionOrder.findMany({
        where: {
          userId: userId,
          payment: {
            status: PaymentStatus.COMPLETED,
          },
        },
        include: {
          payment: true,
        },
        orderBy: {
          createdAt: SortDirection.DESC,
        },
      });

      const totalCount = result.length;

      const skip = Number(query.pageSize) * (Number(query.page) - 1);

      const payments = await this.prismaClient.subscriptionOrder.findMany({
        where: {
          userId: userId,
          payment: {
            status: PaymentStatus.COMPLETED,
          },
        },
        include: {
          payment: true,
        },
        orderBy: {
          createdAt: SortDirection.DESC,
        },
        skip: skip,
        take: Number(query.pageSize),
      });

      return {
        payments,
        totalCount,
      };
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async getAllPayments(pagination: PaginationInputPayments) {
    try {
      const skip = pagination.pageSize * (pagination.page - 1);

      const result = await this.prismaClient.subscriptionOrder.findMany();
      const totalCount = result.length;

      let where = {};
      if (pagination.search && pagination.search.trim() !== '') {
        where = {
          user: {
            username: {
              contains: pagination.search,
              mode: 'insensitive',
            },
          },
        };
      }
      const payments = await this.prismaClient.subscriptionOrder.findMany({
        where,
        orderBy: {
          [pagination.sortBy]: pagination.sortOrder,
        },
        include: {
          payment: true,
          user: true,
        },
        skip: skip,
        take: pagination.pageSize,
      });

      return { payments, totalCount };
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return { payments: [], totalCount: 0 };
    } finally {
      await this.prismaClient.$disconnect();
    }
  }
}
