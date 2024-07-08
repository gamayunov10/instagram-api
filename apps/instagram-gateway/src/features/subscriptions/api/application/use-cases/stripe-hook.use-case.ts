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
      await this.createSubscriber(userId, subscriptionData);
      // await this.subscriptionsService.sendaAutomaticSubscriptionNotifications(
      //   order.userId,
      // );
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
  private async createSubscriber(
    userId: string,
    eventData: Stripe.Stripe.Subscription,
  ) {
    const customerId = eventData.customer as string;
    const subscriptionId = eventData.id;
    const startDate = new Date(eventData.start_date);
    const endDate = new Date(eventData.ended_at);
    const paymentSystem = PaymentType.STRIPE;

    await this.subscribersRepository.createSubscriber(
      userId,
      customerId,
      subscriptionId,
      startDate,
      endDate,
      paymentSystem,
    );
  }
}
