import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../base/enums/node-env.enum';
import { PaymentTransactionPayloadType } from '../models/types/payment-transaction-payload.type';
import { OrderPayloadType } from '../models/types/order-payload.type';

@Injectable()
export class SubscriptionsRepository {
  private readonly logger = new Logger(SubscriptionsRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}

  async createOrder(
    data: Partial<OrderPayloadType>,
    userId: string,
  ): Promise<boolean> {
    try {
      const result = await this.prismaClient.subscriptionOrder.create({
        data: {
          userId: userId,
          productId: data.productId,
          price: data.price,
          paymentId: data.paymentId,
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

  async createPaymentTransaction(
    data: Partial<PaymentTransactionPayloadType>,
  ): Promise<string> {
    try {
      const result =
        await this.prismaClient.subscriptionPaymentTransaction.create({
          data: {
            price: data.price,
            paymentSystem: data.paymentSystem,
            status: data.status,
            url: data.url,
            openedPaymentData: data.openedPaymentData,
            confirmedPaymentData: data.confirmedPaymentData,
          },
        });

      return result.id;
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async updateAllPaymentTransaction(
    id: string,
    data: Partial<PaymentTransactionPayloadType>,
  ): Promise<string | boolean> {
    try {
      const result =
        await this.prismaClient.subscriptionPaymentTransaction.update({
          where: { id },
          data: {
            price: data.price,
            paymentSystem: data.paymentSystem,
            status: data.status,
            url: data.url,
            openedPaymentData: data.openedPaymentData,
            confirmedPaymentData: data.confirmedPaymentData,
          },
        });

      return result.id;
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }

      return false;
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async updatePaymentTransaction(
    id: string,
    data: Partial<PaymentTransactionPayloadType>,
  ): Promise<string | boolean> {
    try {
      const result =
        await this.prismaClient.subscriptionPaymentTransaction.update({
          where: { id },
          data: {
            status: data.status,
            confirmedPaymentData: data.confirmedPaymentData,
          },
        });

      return result.id;
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
