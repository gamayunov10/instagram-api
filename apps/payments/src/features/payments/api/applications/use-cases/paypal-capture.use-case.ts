import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ResultCode } from '../../../../../../../instagram-gateway/src/base/enums/result-code.enum';
import { NodeEnv } from '../../../../../../../instagram-gateway/src/base/enums/node-env.enum';
import { PaypalAdapter } from '../../../../../base/application/adapters/paypal.adapter';

export class PaypalCaptureCommand {
  constructor(public readonly token: string) {}
}

@CommandHandler(PaypalCaptureCommand)
export class PaypalCaptureUseCase
  implements ICommandHandler<PaypalCaptureCommand>
{
  logger = new Logger(PaypalCaptureUseCase.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly paypalAdapter: PaypalAdapter,
  ) {}

  async execute(command: PaypalCaptureCommand) {
    try {
      const result = await this.paypalAdapter.captureOrder(command.token);

      return {
        data: true,
        code: ResultCode.Success,
        response: result,
      };
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
