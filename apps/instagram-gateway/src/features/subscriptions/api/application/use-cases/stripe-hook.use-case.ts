import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { ResultCode } from '../../../../../base/enums/result-code.enum';
import { SubscriptionsRepository } from '../../../infrastructure/subscriptions.repo';
import { SubscriptionsQueryRepository } from '../../../infrastructure/subscriptions.query.repo';
import { SubscriptionsService } from '../../subscriptions.service';
import { AccountType } from '../../../../../../../../libs/common/base/ts/enums/account-type.enum';
import { PaymentStatus } from '../../../../../../../../libs/common/base/ts/enums/payment-status.enum';
import { StripeEventSubscriptionCreatedDataType } from '../../../models/types/stripe-event-subscription-created-data';
import { PaymentType } from '../../../../../../../../libs/common/base/ts/enums/payment-type.enum';
import { SubscribersRepository } from '../../../infrastructure/subscriber/subscribers.repo';

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

    if (command.data?.type === 'checkout.session.completed') {
      const order = await this.subscriptionsQueryRepo.findOrderByPaymentId(
        command.data.data.client_reference_id,
      );
      let autoRenewal: boolean = false;

      if (command.data.response.object === 'subscription') {
        autoRenewal = true;
        await this.createSubscriber(order.userId, event.res.response);
      }

      const payload = {
        status: PaymentStatus.COMPLETED,
        confirmedPaymentData: command.data,
      };

      await this.subscriptionsRepo.updatePaymentTransaction(
        command.data.data.object.client_reference_id,
        payload,
      );

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

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
  private async createSubscriber(
    userId: string,
    eventData: StripeEventSubscriptionCreatedDataType,
  ) {
    const customerId = eventData.customer;
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
