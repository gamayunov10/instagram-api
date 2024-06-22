import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { MakePaymentRequest } from '../../../../../../libs/common/base/subscriptions/make-payment-request';
import { ResultCode } from '../../../../../instagram-gateway/src/base/enums/result-code.enum';
import { NodeEnv } from '../../../../../instagram-gateway/src/base/enums/node-env.enum';

export class StripeAdapter {
  logger = new Logger(StripeAdapter.name);
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
  public async createAutoSubscription(payload: MakePaymentRequest) {
    let interval;

    switch (payload.interval) {
      case 'MONTHLY':
        interval = 'month';
        break;
      case 'WEEKLY':
        interval = 'week';
        break;
      case 'DAY':
        interval = 'day';
        break;
      default:
        return {
          data: false,
          code: ResultCode.InternalServerError,
        };
    }
    try {
      // Checking the existence of a client or creating a new one
      let customer;
      const existingCustomers = await this.stripe.customers.list({
        email: payload.user.email,
      });
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await this.stripe.customers.create({
          name: payload.user.username,
          email: payload.user.email,
          description: payload.product_data.description,
        });
      }
      console.log(customer.id);
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
              recurring: {
                interval: interval,
                interval_count: payload.quantity,
              },
              unit_amount: payload.unit_amount,
              currency: 'USD',
            },
            quantity: payload.quantity,
          },
        ],
        mode: 'subscription',
        client_reference_id: payload.client_reference_id,
        customer: customer.id,
      });

      console.log(result.id);
      const subscription = result.subscription;
      console.log(subscription);

      return {
        data: true,
        code: ResultCode.Success,
        response: {
          status: result.status,
          url: result.url,
          openedPaymentData: result,
          subscription: subscription,
        },
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
