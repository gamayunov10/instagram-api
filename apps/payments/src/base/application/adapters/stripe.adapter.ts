import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

import { MakePaymentRequest } from '../../../../../../libs/common/base/subscriptions/make-payment-request';
import { ResultCode } from '../../../../../instagram-gateway/src/base/enums/result-code.enum';

export class StripeAdapter {
  configService = new ConfigService();
  stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET'));
  constructor() {}

  public async makePayment(payload: MakePaymentRequest) {
    const result = await this.stripe.checkout.sessions.create({
      success_url: payload.success_url,
      cancel_url: payload.cancel_url,
      line_items: [
        {
          price_data: {
            product_data: {
              name: payload.product_data.name,
              description: payload.product_data.description,
            },
            unit_amount: payload.unit_amount,
            currency: 'USD',
          },
          quantity: payload.quantity,
        },
      ],
      mode: 'payment',
      client_reference_id: payload.client_reference_id,
    });

    const res = {
      status: result.status,
      url: result.url,
      openedPaymentData: result,
    };

    return {
      data: true,
      code: ResultCode.Success,
      response: res,
    };
  }
}
