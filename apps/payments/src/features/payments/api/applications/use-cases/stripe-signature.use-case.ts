import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { ResultCode } from '../../../../../../../instagram-gateway/src/base/enums/result-code.enum';
import { StripeSignatureRequest } from '../../../../../../../../libs/common/base/subscriptions/stripe-signature-request';
import { NodeEnv } from '../../../../../../../instagram-gateway/src/base/enums/node-env.enum';

export class StripeSignatureCommand {
  constructor(public readonly payload: StripeSignatureRequest) {}
}

@CommandHandler(StripeSignatureCommand)
export class StripeSignatureUseCase
  implements ICommandHandler<StripeSignatureCommand>
{
  logger = new Logger(StripeSignatureUseCase.name);

  constructor(private readonly configService: ConfigService) {}

  async execute(command: StripeSignatureCommand) {
    try {
      const stripe = new Stripe(this.configService.get('STRIPE_SECRET'));

      const dataBuffer = command.payload.data;

      const event = stripe.webhooks.constructEvent(
        dataBuffer,
        command.payload.signature,
        this.configService.get('STRIPE_SIGNING_SECRET'),
      );

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          data: true,
          code: ResultCode.Success,
          response: event,
        };
      }

      if (event.type === 'customer.subscription.created') {
        const session = event.data.object as Stripe.Subscription;
        return {
          data: true,
          code: ResultCode.Success,
          response: event,
        };
      }

      return {
        data: true,
        code: ResultCode.Success,
        response: 'pending',
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
