import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { Request } from 'express';

import { ResultCode } from '../../../../../base/enums/result-code.enum';
import { SubscriptionsRepository } from '../../../infrastructure/subscriptions.repo';
import { SubscriptionsQueryRepository } from '../../../infrastructure/subscriptions.query.repo';
import { SubscriptionsService } from '../../subscriptions.service';
import { AccountType } from '../../../../../../../../libs/common/base/ts/enums/account-type.enum';
import { PaymentStatus } from '../../../../../../../../libs/common/base/ts/enums/payment-status.enum';
import { PaymentType } from '../../../../../../../../libs/common/base/ts/enums/payment-type.enum';
import { SubscribersRepository } from '../../../infrastructure/subscriber/subscribers.repo';
import { PaymentTransactionPayloadType } from '../../../models/types/payment-transaction-payload.type';
import { PaypalEventSubscriptionActiveData } from '../../../models/types/paypal-event-subscription-active-data';
import { PaypalBaseEventType } from '../../../models/types/paypal-base-event.type';
import { PaypalEventPaymentDataType } from '../../../models/types/paypal-event-payment-data.type';

export class PaypalEventHookCommand {
  constructor(
    public readonly signature: Request,
    public readonly data: any,
  ) {}
}

@CommandHandler(PaypalEventHookCommand)
export class PaypalEventHookUseCase
  implements ICommandHandler<PaypalEventHookCommand>
{
  private readonly logger = new Logger(PaypalEventHookUseCase.name);

  constructor(
    private readonly subscriptionsRepo: SubscriptionsRepository,
    private readonly subscriptionsQueryRepo: SubscriptionsQueryRepository,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly subscribersRepository: SubscribersRepository,
  ) {}

  async execute(command: PaypalEventHookCommand) {
    // TODO signature => VerifyPaypalHookUseCase important!
    const event = command.data as PaypalBaseEventType;

    if (event.event_type === 'PAYMENT.SALE.COMPLETED') {
      const paymentData = event as PaypalEventPaymentDataType;

      const order = await this.subscriptionsQueryRepo.findOrderByPaymentId(
        paymentData.resource.custom,
      );

      if (!order) {
        return {
          data: false,
          code: ResultCode.InternalServerError,
        };
      }

      const payload: Partial<PaymentTransactionPayloadType> = {
        status: PaymentStatus.COMPLETED,
        confirmedPaymentData: command.data,
      };

      await this.subscriptionsRepo.updatePaymentTransaction(
        paymentData.resource.custom,
        payload,
      );

      const autoRenewal: boolean = false;

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

    if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const subscriptionData = event as PaypalEventSubscriptionActiveData;

      const order = await this.subscriptionsQueryRepo.findOrderByPaymentId(
        subscriptionData.resource.custom_id,
      );

      const userId: string = order.userId;
      const interval = order.subscriptionTime as string;
      const customerId = subscriptionData.resource.subscriber
        .payer_id as string;

      const subscriptionId = subscriptionData.resource.id;

      const startDate = new Date(subscriptionData.resource.start_time);
      const endDate = await this.subscriptionsService.endDateOfSubscription(
        order.price,
        order.subscriptionTime,
        startDate,
      );

      const paymentSystem = PaymentType.PAYPAL;

      const autoRenewal: boolean = true;

      await this.subscriptionsService.updateAccountType(
        order.userId,
        AccountType.BUSINESS,
        order.price,
        order.subscriptionTime,
        autoRenewal,
      );

      const subscriber = await this.subscribersRepository.createSubscriber(
        userId,
        customerId,
        subscriptionId,
        interval.toUpperCase(),
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
