import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../base/enums/node-env.enum';
import { SubscriptionTime } from '../../../../../../libs/common/base/ts/enums/subscription-time.enum';
import { MyPaymentsQueryModel } from '../models/query/my-paymants.query.model';
import { PaymentStatus } from '../../../../../../libs/common/base/ts/enums/payment-status.enum';
import { SortDirection } from '../../../base/enums/sort/sort.direction.enum';
import { PaginationInputPayments } from '../../../resolvers/payments/models/pagination-payments-input';
import { PaginationInputPaymentsWithSearch } from '../../../resolvers/payments/models/pagination-payments-input-with-search';

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
  async getAllPayments(pagination: PaginationInputPaymentsWithSearch) {
    try {
      const skip = pagination.pageSize * (pagination.page - 1);

      let where = {};
      if (pagination.search && pagination.search.trim() !== '') {
        where = {
          user: {
            username: {
              contains: pagination.search,
              mode: 'insensitive',
            },
          },
          payment: {
            status: PaymentStatus.COMPLETED,
          },
        };
      }
      let orderBy: Record<string, any> = {};
      switch (pagination.sortBy) {
        case 'username':
          orderBy = {
            user: {
              username: pagination.sortOrder,
            },
          };
          break;
        case 'createdAt':
          orderBy = {
            createdAt: pagination.sortOrder,
          };
          break;
        case 'amount':
          orderBy = {
            payment: {
              price: pagination.sortOrder,
            },
          };
          break;
        case 'paymentMethod':
          orderBy = {
            payment: {
              paymentSystem: pagination.sortOrder,
            },
          };
          break;
        case 'dateAdded':
          orderBy = {
            createdAt: pagination.sortOrder,
          };
          break;
        default:
          orderBy = {
            createdAt: pagination.sortOrder,
          };
      }

      const payments = await this.prismaClient.subscriptionOrder.findMany({
        where,
        orderBy,
        skip: skip,
        take: pagination.pageSize,
        include: {
          payment: true,
          user: true,
        },
      });

      const totalCount = await this.prismaClient.subscriptionOrder.count({
        where,
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

  async getAllPaymentsByUser(
    userId: string,
    pagination: PaginationInputPayments,
  ) {
    try {
      const skip = pagination.pageSize * (pagination.page - 1);

      const where = {
        userId: userId,
        payment: {
          status: PaymentStatus.COMPLETED,
        },
      };

      let orderBy: Record<string, any> = {};
      switch (pagination.sortBy) {
        case 'createdAt':
          orderBy = {
            createdAt: pagination.sortOrder,
          };
          break;
        case 'amount':
          orderBy = {
            payment: {
              price: pagination.sortOrder,
            },
          };
          break;
        case 'paymentMethod':
          orderBy = {
            payment: {
              paymentSystem: pagination.sortOrder,
            },
          };
          break;
        case 'dateAdded':
          orderBy = {
            createdAt: pagination.sortOrder,
          };
          break;
        default:
          orderBy = {
            createdAt: pagination.sortOrder,
          };
      }

      const payments = await this.prismaClient.subscriptionOrder.findMany({
        where,
        orderBy,
        skip: skip,
        take: pagination.pageSize,
        include: {
          payment: true,
          user: true,
        },
      });

      const totalCount = await this.prismaClient.subscriptionOrder.count({
        where,
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
