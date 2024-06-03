import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, timeout } from 'rxjs';

import {
  CREATE_PAYMENT,
  PAYPAL_CAPTURE,
  STRIPE_SIGNATURE,
} from '../../../../../../libs/common/base/constants/service.constants';
import { ResultCode } from '../../enums/result-code.enum';
import { noneField } from '../../constants/constants';
import { NodeEnv } from '../../enums/node-env.enum';
import { StripeSignatureRequest } from '../../../../../../libs/common/base/subscriptions/stripe-signature-request';
import { MakePaymentRequest } from '../../../../../../libs/common/base/subscriptions/make-payment-request';

@Injectable()
export class PaymentsServiceAdapter {
  logger = new Logger(PaymentsServiceAdapter.name);

  constructor(
    @Inject('PAYMENTS_SERVICE')
    private readonly paymentsServiceClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  async makePayment(payload: MakePaymentRequest) {
    try {
      const response = this.paymentsServiceClient
        .send({ cmd: CREATE_PAYMENT }, payload)
        .pipe(timeout(10000));

      const result = await firstValueFrom(response);

      return {
        data: true,
        code: ResultCode.Success,
        res: result,
      };
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }

      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: noneField,
        message: 'error: 3041',
      };
    }
  }

  async stripeSignature(payload: StripeSignatureRequest) {
    try {
      const response = this.paymentsServiceClient
        .send({ cmd: STRIPE_SIGNATURE }, payload)
        .pipe(timeout(10000));

      const result = await firstValueFrom(response);

      return {
        data: true,
        code: ResultCode.Success,
        res: result,
      };
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }

      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: noneField,
        message: 'error: 3042',
      };
    }
  }

  async paypalCapture(payload: string) {
    try {
      const response = this.paymentsServiceClient
        .send({ cmd: PAYPAL_CAPTURE }, payload)
        .pipe(timeout(10000));

      const result = await firstValueFrom(response);

      return {
        data: true,
        code: ResultCode.Success,
        res: result,
      };
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }

      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: noneField,
        message: 'error: 3043',
      };
    }
  }
}
