import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { ResultCode } from '../../../../../base/enums/result-code.enum';
import { SubscriptionsRepository } from '../../../infrastructure/subscriptions.repo';
import { SubscriptionsQueryRepository } from '../../../infrastructure/subscriptions.query.repo';
import { SubscriptionsService } from '../../subscriptions.service';
import { AccountType } from '../../../../../../../../libs/common/base/ts/enums/account-type.enum';
import { PaymentStatus } from '../../../../../../../../libs/common/base/ts/enums/payment-status.enum';

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
    private readonly subscriptionsRepo: SubscriptionsRepository,
    private readonly subscriptionsQueryRepo: SubscriptionsQueryRepository,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async execute(command: StripeHookCommand) {
    // TODO signature => StripeSignatureUseCase important!

    if (command.data?.type === 'checkout.session.completed') {
      const order = await this.subscriptionsQueryRepo.findOrderByPaymentId(
        command.data.data.client_reference_id,
      );

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
}
