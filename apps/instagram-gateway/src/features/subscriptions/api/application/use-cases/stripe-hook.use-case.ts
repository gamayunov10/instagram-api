import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { ResultCode } from '../../../../../base/enums/result-code.enum';
import { SubscriptionsRepository } from '../../../infrastructure/subscriptions.repo';
import { SubscriptionsQueryRepository } from '../../../infrastructure/subscriptions.query.repo';
import { PaymentsServiceAdapter } from '../../../../../base/application/adapters/payments-service.adapter';
import { StripeSignatureRequest } from '../../../../../../../../libs/common/base/subscriptions/stripe-signature-request';
import { UsersRepository } from '../../../../users/infrastructure/users.repo';
import { AccountType } from '../../../../../../../../libs/common/base/ts/enums/account-type.enum';
import { UsersQueryRepository } from '../../../../users/infrastructure/users.query.repo';
import { SubscriptionsService } from '../../subscriptions.service';
import { StripeEventSubscriptionCreatedDataType } from '../../../models/types/stripe-event-subscription-created-data';
import { PaymentType } from '../../../../../../../../libs/common/base/ts/enums/payment-type.enum';
import { SubscribersRepository } from '../../../infrastructure/subscriber/subscribers.repo';

export class StripeHookCommand {
  constructor(
    public readonly signature: string,
    public readonly data: Buffer,
  ) {}
}

@CommandHandler(StripeHookCommand)
export class StripeHookUseCase implements ICommandHandler<StripeHookCommand> {
  private readonly logger = new Logger(StripeHookUseCase.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly subscriptionsRepo: SubscriptionsRepository,
    private readonly subscriptionsQueryRepo: SubscriptionsQueryRepository,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly subscribersRepository: SubscribersRepository,
  ) {}

  async execute(command: StripeHookCommand) {
    const eventPayload: StripeSignatureRequest = {
      data: command.data,
      signature: command.signature,
    };
    const event =
      await this.paymentsServiceAdapter.stripeSignature(eventPayload);
    if (!event.data) {
      return {
        data: false,
        code: ResultCode.InternalServerError,
      };
    }
    let autoRenewal: boolean = false;

    if (event.res.response !== 'pending') {
      const order = await this.subscriptionsQueryRepo.findOrderByPaymentId(
        event.res.response.client_reference_id,
      );

      if (event.res.response.object === 'subscription') {
        autoRenewal = true;
        await this.createSubscriber(order.userId, event.res.response);
      }

      const payload = {
        status: event.res.response.status,
        confirmedPaymentData: event.res.response,
      };

      await this.subscriptionsRepo.updatePaymentTransaction(
        event.res.response.client_reference_id,
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
