import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { ResultCode } from '../../../../../base/enums/result-code.enum';
import { SubscriptionsRepository } from '../../../infrastructure/subscriptions.repo';
import { SubscriptionsQueryRepository } from '../../../infrastructure/subscriptions.query.repo';
import { PaymentsServiceAdapter } from '../../../../../base/application/adapters/payments-service.adapter';
import { StripeSignatureRequest } from '../../../../../../../../libs/common/base/subscriptions/stripe-signature-request';
import { UsersRepository } from '../../../../users/infrastructure/users.repo';
import { AccountType } from '../../../../../../../../libs/common/base/ts/enums/account-type.enum';
import { SendSuccessSubscriptionCommand } from '../../../../notifications/application/use-cases/send-success-subscription-message.use-case';
import { NodeEnv } from '../../../../../base/enums/node-env.enum';
import { UsersQueryRepository } from '../../../../users/infrastructure/users.query.repo';

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
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
    private readonly subscriptionsRepo: SubscriptionsRepository,
    private readonly subscriptionsQueryRepo: SubscriptionsQueryRepository,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
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

      const user = await this.usersQueryRepository.findUserById(order.userId);

      try {
        await this.commandBus.execute(
          new SendSuccessSubscriptionCommand(user.username, user.email),
        );
      } catch (e) {
        if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
          this.logger.error(e);
        }

        await this.commandBus.execute(
          new SendSuccessSubscriptionCommand(user.username, user.email),
        );
      }
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
