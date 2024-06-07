import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';

import { MakePaymentRequest } from '../../../../../../libs/common/base/subscriptions/make-payment-request';
import { NodeEnv } from '../../../../../instagram-gateway/src/base/enums/node-env.enum';
import { ResultCode } from '../../../../../instagram-gateway/src/base/enums/result-code.enum';

@Injectable()
export class PaypalAdapter {
  logger = new Logger(PaypalAdapter.name);
  configService = new ConfigService();
  private readonly baseUrl: string;
  private readonly hookUrl: string;
  private readonly clientId: string;
  private readonly secret: string;
  constructor() {
    this.baseUrl = this.configService.get<string>('PAYPAL_BASE_URL');
    this.hookUrl = this.configService.get<string>('PAYPAL_HOOK_URL');
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    this.secret = this.configService.get<string>('PAYPAL_SECRET');
  }

  private async generateAccessToken(): Promise<string> {
    const credentials = btoa(this.clientId + ':' + this.secret);

    const response = await fetch(`${this.baseUrl}v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
  }

  async createOrder(payload: MakePaymentRequest) {
    const token = await this.generateAccessToken();

    try {
      const response = await fetch(`${this.baseUrl}v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: payload.client_reference_id,
              amount: {
                currency_code: 'USD',
                value: (payload.unit_amount / 100) * payload.quantity,
              },
            },
          ],
          application_context: {
            return_url: `${this.hookUrl}api/v1/subscriptions/paypal-hook`,
            cancel_url: `${this.hookUrl}api/v1/subscriptions/paypal-hook`,
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
          },
        }),
      });

      const data = await response.json();

      const link = data.links.find((link) => link.rel === 'approve');

      const res = {
        status: data.status,
        url: link.href,
        openedPaymentData: data,
      };

      return {
        data: true,
        code: ResultCode.Success,
        response: res,
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

  async captureOrder(orderId: string) {
    const token = await this.generateAccessToken();

    try {
      const response = await fetch(
        `${this.baseUrl}v2/checkout/orders/${orderId}/capture`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      return {
        data: true,
        code: ResultCode.Success,
        response: data,
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
