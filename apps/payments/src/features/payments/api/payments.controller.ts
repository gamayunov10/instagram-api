import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';

import {
  CREATE_PAYMENT,
  STRIPE_SIGNATURE,
} from '../../../../../../libs/common/base/constants/service.constants';
import { MakePaymentRequest } from '../../../../../../libs/common/base/subscriptions/make-payment-request';
import { StripeSignatureRequest } from '../../../../../../libs/common/base/subscriptions/stripe-signature-request';

import { PaymentsService } from './payments.service';
import { StripeSignatureCommand } from './applications/use-cases/stripe-signature.use-case';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly paymentsService: PaymentsService,
  ) {}

  @MessagePattern({ cmd: CREATE_PAYMENT })
  async createPayment(payload: MakePaymentRequest) {
    return this.paymentsService.makePayment(payload);
  }

  @MessagePattern({ cmd: STRIPE_SIGNATURE })
  async stripeSignature(payload: StripeSignatureRequest) {
    return this.commandBus.execute(new StripeSignatureCommand(payload));
  }
}
