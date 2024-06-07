import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { ResultCode } from '../../../../../base/enums/result-code.enum';
import { SubscriptionsRepository } from '../../../infrastructure/subscriptions.repo';
import { SubscriptionsQueryRepository } from '../../../infrastructure/subscriptions.query.repo';
import { PaymentsServiceAdapter } from '../../../../../base/application/adapters/payments-service.adapter';
import { UsersRepository } from '../../../../users/infrastructure/users.repo';
import { AccountType } from '../../../../../../../../libs/common/base/ts/enums/account-type.enum';
import { UsersQueryRepository } from '../../../../users/infrastructure/users.query.repo';
import { SubscriptionsService } from '../../subscriptions.service';

export class PaypalHookCommand {
  constructor(public readonly token: string) {}
}

@CommandHandler(PaypalHookCommand)
export class PaypalHookUseCase implements ICommandHandler<PaypalHookCommand> {
  private readonly logger = new Logger(PaypalHookUseCase.name);

  constructor(
    private readonly subscriptionsRepo: SubscriptionsRepository,
    private readonly subscriptionsQueryRepo: SubscriptionsQueryRepository,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
    private readonly configService: ConfigService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async execute(command: PaypalHookCommand) {
    const event = await this.paymentsServiceAdapter.paypalCapture(
      command.token,
    );

    if (!event.data) {
      return {
        data: false,
        code: ResultCode.InternalServerError,
      };
    }

    const transactionId =
      event.res.response.response.purchase_units[0].reference_id;

    const order =
      await this.subscriptionsQueryRepo.findOrderByPaymentId(transactionId);

    const payload = {
      status: event.res.response.response.status,
      confirmedPaymentData: event.res.response.response,
    };

    await this.subscriptionsRepo.updatePaymentTransaction(
      transactionId,
      payload,
    );

    await this.subscriptionsService.updateAccountType(
      order.userId,
      AccountType.BUSINESS,
      order.price,
      order.subscriptionTime,
    );

    await this.subscriptionsService.sendSubscriptionNotification(order.userId);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
