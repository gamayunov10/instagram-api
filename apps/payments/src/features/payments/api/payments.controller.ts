import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';

import {
  CREATE_AUTO_SUBSCRIPTION,
  CREATE_PAYMENT,
  PAYPAL_CAPTURE,
  STRIPE_SIGNATURE,
  VERIFY_PAYPAL_HOOK,
} from '../../../../../../libs/common/base/constants/service.constants';
import { MakePaymentRequest } from '../../../../../../libs/common/base/subscriptions/make-payment-request';
import { StripeSignatureRequest } from '../../../../../../libs/common/base/subscriptions/stripe-signature-request';
import { PaypalSignatureRequest } from '../../../../../../libs/common/base/subscriptions/paypal-signature-request';

import { PaymentsService } from './payments.service';
import { StripeSignatureCommand } from './applications/use-cases/stripe-signature.use-case';
import { PaypalCaptureCommand } from './applications/use-cases/paypal-capture.use-case';
import { VerifyPaypalSignatureCommand } from './applications/use-cases/verify-paypal.use-case';

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

  @MessagePattern({ cmd: CREATE_AUTO_SUBSCRIPTION })
  async createAutoPayment(payload: MakePaymentRequest) {
    return this.paymentsService.createAutoPayment(payload);
  }

  @MessagePattern({ cmd: STRIPE_SIGNATURE })
  async stripeSignature(payload: StripeSignatureRequest) {
    return this.commandBus.execute(new StripeSignatureCommand(payload));
  }

  @MessagePattern({ cmd: PAYPAL_CAPTURE })
  async paypalCapture(token: string) {
    return this.commandBus.execute(new PaypalCaptureCommand(token));
  }

  @MessagePattern({ cmd: VERIFY_PAYPAL_HOOK })
  async verifyPaypalSignature(payload: PaypalSignatureRequest) {
    return this.commandBus.execute(new VerifyPaypalSignatureCommand(payload));
  }
}
