import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Stripe from 'stripe';

import { ResultCode } from '../../../../../base/enums/result-code.enum';
import { SubscriptionsRepository } from '../../../infrastructure/subscriptions.repo';
import { SubscriptionsQueryRepository } from '../../../infrastructure/subscriptions.query.repo';
import { SubscriptionsService } from '../../subscriptions.service';
import { AccountType } from '../../../../../../../../libs/common/base/ts/enums/account-type.enum';
import { PaymentStatus } from '../../../../../../../../libs/common/base/ts/enums/payment-status.enum';
import { PaymentType } from '../../../../../../../../libs/common/base/ts/enums/payment-type.enum';
import { SubscribersRepository } from '../../../infrastructure/subscriber/subscribers.repo';
import { PaymentTransactionPayloadType } from '../../../models/types/payment-transaction-payload.type';
import { PaymentsServiceAdapter } from '../../../../../base/application/adapters/payments-service.adapter';

export class StripeHookCommand {
  constructor(
    public readonly signature: string,
    public readonly data: any,
  ) {}
}

@CommandHandler(StripeHookCommand)
export class StripeHookUseCase implements ICommandHandler<StripeHookCommand> {
  private readonly logger = new Logger(StripeHookUseCase.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly subscriptionsRepo: SubscriptionsRepository,
    private readonly subscriptionsQueryRepo: SubscriptionsQueryRepository,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly subscribersRepository: SubscribersRepository,
  ) {}

  async execute(command: StripeHookCommand) {
    // TODO signature => StripeSignatureUseCase important!
    const event = command.data as Stripe.Stripe.Event; // StripeEventDataType;

    if (event.type === 'checkout.session.completed') {
      const checkoutSession = event.data
        .object as Stripe.Stripe.Checkout.Session;

      const order = await this.subscriptionsQueryRepo.findOrderByPaymentId(
        checkoutSession.client_reference_id,
      );

      const payload: Partial<PaymentTransactionPayloadType> = {
        status: PaymentStatus.COMPLETED,
        confirmedPaymentData: command.data,
      };

      await this.subscriptionsRepo.updatePaymentTransaction(
        checkoutSession.client_reference_id,
        payload,
      );

      let autoRenewal: boolean = false;

      if (checkoutSession.mode === 'subscription') {
        autoRenewal = true;
      }

      await this.subscriptionsService.updateAccountType(
        order.userId,
        AccountType.BUSINESS,
        order.price,
        order.subscriptionTime,
        autoRenewal,
      );

      await this.subscriptionsService.sendSubscriptionNotification(
        order.userId,
      );
    }

    if (event.type === 'customer.subscription.created') {
      const subscriptionData = event.data.object as Stripe.Stripe.Subscription;

      const userId: string = subscriptionData.metadata.userId;
      const interval = subscriptionData.items.data[0].plan.interval as string;
      const customerId = subscriptionData.customer as string;
      const subscriptionId = subscriptionData.id;
      const startDate = new Date(subscriptionData.current_period_start * 1000);
      const endDate = new Date(subscriptionData.current_period_end * 1000);
      const paymentSystem = PaymentType.STRIPE;

      const subscriber = await this.subscribersRepository.createSubscriber(
        userId,
        customerId,
        subscriptionId,
        interval,
        startDate,
        endDate,
        paymentSystem,
      );

      if (!subscriber) {
        return {
          data: false,
          code: ResultCode.InternalServerError,
        };
      }

      await this.subscriptionsService.sendNotificationsAboutAutomaticDebiting(
        userId,
        interval,
      );
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
