import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ResultCode } from '../../../../../base/enums/result-code.enum';
import { SubscriptionsRepository } from '../../../infrastructure/subscriptions.repo';
import { SubscriptionsQueryRepository } from '../../../infrastructure/subscriptions.query.repo';
import { PaymentsServiceAdapter } from '../../../../../base/application/adapters/payments-service.adapter';
import { StripeSignatureRequest } from '../../../../../../../../libs/common/base/subscriptions/stripe-signature-request';
import { UsersRepository } from '../../../../users/infrastructure/users.repo';
import { AccountType } from '../../../../../../../../libs/common/base/ts/enums/account-type.enum';

export class StripeHookCommand {
  constructor(
    public readonly signature: string,
    public readonly data: Buffer,
  ) {}
}

@CommandHandler(StripeHookCommand)
export class StripeHookUseCase implements ICommandHandler<StripeHookCommand> {
  constructor(
    private readonly subscriptionsRepo: SubscriptionsRepository,
    private readonly subscriptionsQueryRepo: SubscriptionsQueryRepository,
    private readonly usersRepository: UsersRepository,
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
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

    if (event.res.response !== 'pending') {
      const payload = {
        status: event.res.response.status,
        confirmedPaymentData: event.res.response,
      };

      await this.subscriptionsRepo.updatePaymentTransaction(
        event.res.response.client_reference_id,
        payload,
      );

      const order = await this.subscriptionsQueryRepo.findOrderByPaymentId(
        event.res.response.client_reference_id,
      );

      await this.usersRepository.updateAccountType(
        order.userId,
        AccountType.BUSINESS,
      );
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
