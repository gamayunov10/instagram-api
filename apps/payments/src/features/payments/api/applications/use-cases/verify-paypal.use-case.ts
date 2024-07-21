import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { PaypalAdapter } from '../../../../../base/application/adapters/paypal.adapter';
import { PaypalSignatureRequest } from '../../../../../../../../libs/common/base/subscriptions/paypal-signature-request';
import { NodeEnv } from '../../../../../../../instagram-gateway/src/base/enums/node-env.enum';
import { ResultCode } from '../../../../../../../instagram-gateway/src/base/enums/result-code.enum';

export class VerifyPaypalSignatureCommand {
  constructor(public readonly data: PaypalSignatureRequest) {}
}

@CommandHandler(VerifyPaypalSignatureCommand)
export class VerifyPaypalSignatureUseCase
  implements ICommandHandler<VerifyPaypalSignatureCommand>
{
  logger = new Logger(VerifyPaypalSignatureUseCase.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly paypalAdapter: PaypalAdapter,
  ) {}
  async execute(command: VerifyPaypalSignatureCommand) {
    try {
      const result = await this.paypalAdapter.verifyPaypalSignature(
        command.data.request,
        command.data.data,
      );

      if (result) {
        return {
          data: true,
          code: ResultCode.Success,
          response: result,
        };
      } else {
        return {
          data: false,
          code: ResultCode.InternalServerError,
        };
      }
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }

      return {
        data: false,
        code: ResultCode.InternalServerError,
      };
    }
  }
}
