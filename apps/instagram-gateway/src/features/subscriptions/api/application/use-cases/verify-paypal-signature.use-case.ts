import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import Buffer from 'node:buffer';
import { Request } from 'express';

import { PaymentsServiceAdapter } from '../../../../../base/application/adapters/payments-service.adapter';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import { PaypalSignatureRequest } from '../../../../../../../../libs/common/base/subscriptions/paypal-signature-request';
import { ExceptionResultType } from '../../../../../base/types/exception.type';

export class VerifyPaypalHookCommand {
  constructor(
    public readonly request: Request,
    public readonly data: Buffer,
  ) {}
}

@CommandHandler(VerifyPaypalHookCommand)
export class VerifyPaypalHookUseCase
  implements ICommandHandler<VerifyPaypalHookCommand>
{
  constructor(
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
  ) {}
  async execute(
    command: VerifyPaypalHookCommand,
  ): Promise<ExceptionResultType<boolean>> {
    {
      const payload: PaypalSignatureRequest = {
        request: command.request as Request,
        data: command.data,
      };

      const result =
        await this.paymentsServiceAdapter.verifyPaypalHook(payload);

      if (!result.data) {
        return {
          data: false,
          code: ResultCode.InternalServerError,
        };
      }

      return {
        data: true,
        code: ResultCode.Success,
      };
    }
  }
}
