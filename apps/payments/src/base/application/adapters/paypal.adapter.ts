import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { Request } from 'express';

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
  private readonly publicFrontURL: string;
  private readonly webhookPayPalId: string;

  constructor() {
    this.baseUrl = this.configService.get<string>('PAYPAL_BASE_URL');
    this.hookUrl = this.configService.get<string>('PAYPAL_HOOK_URL');
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    this.secret = this.configService.get<string>('PAYPAL_SECRET');
    this.publicFrontURL = this.configService.get<string>('PUBLIC_FRONT_URL');
    this.webhookPayPalId = this.configService.get<string>('WEBHOOK_PAYPAL_ID');
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
        productId: payload.interval,
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
  public async createAutoSubscription(payload: MakePaymentRequest) {
    const token = await this.generateAccessToken();

    try {
      const productId = await this.createProduct(token, payload.product_data);
      const planId = await this.createPlan(productId, payload);

      await this.activatePlan(token, planId);

      const subscriptionData = await this.createSubscription(token, planId);

      const link = subscriptionData.links.find(
        (link) => link.rel === 'approve',
      );

      return {
        data: true,
        code: ResultCode.Success,
        response: {
          status: subscriptionData.status,
          url: link.href,
          openedPaymentData: subscriptionData,
          productId: productId,
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
  private async createProduct(
    token: string,
    payload: { name: string; description: string },
  ) {
    const response = await fetch(`${this.baseUrl}v1/catalogs/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: payload.name,
        description: payload.description,
        type: 'SERVICE',
        category: 'SOFTWARE',
        home_url: this.baseUrl,
      }),
    });

    const data = await response.json();
    return data.id;
  }

  private async createPlan(productId: string, payload: MakePaymentRequest) {
    const token = await this.generateAccessToken();
    let interval;

    switch (payload.interval) {
      case 'MONTHLY':
        interval = 'MONTH';
        break;
      case 'WEEKLY':
        interval = 'WEEK';
        break;
      case 'DAY':
        interval = 'DAY';
        break;
      default:
        return {
          data: false,
          code: ResultCode.InternalServerError,
        };
    }

    const response = await fetch(`${this.baseUrl}v1/billing/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product_id: productId,
        name: payload.product_data.name,
        description: payload.product_data.description,
        billing_cycles: [
          {
            frequency: {
              interval_unit: interval,
              interval_count: payload.quantity,
            },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
              fixed_price: {
                value: (payload.unit_amount / 100) * payload.quantity,
                currency_code: 'USD',
              },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: {
            value: (payload.unit_amount / 100) * payload.quantity,
            currency_code: 'USD',
          },
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3,
        },
      }),
    });

    const data = await response.json();
    return data.id;
  }

  private async activatePlan(token: string, planId: string) {
    await fetch(`${this.baseUrl}v1/billing/plans/${planId}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private async createSubscription(token: string, planId: string) {
    const response = await fetch(`${this.baseUrl}v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          brand_name: 'Your Brand Name',
          locale: 'en-US',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${this.hookUrl}api/v1/subscriptions/paypal-hook`,
          cancel_url: `${this.hookUrl}api/v1/subscriptions/paypal-hook`,
        },
      }),
    });

    return await response.json();
  }

  async verifyPaypalSignature(
    request: Request,
    data: Buffer,
  ): Promise<boolean> {
    const accessToken = this.generateAccessToken();

    const transmissionId = request.headers['paypal-transmission-id'] as string;

    const transmissionTime = request.headers[
      'paypal-transmission-time'
    ] as string;

    const certUrl = request.headers['paypal-cert-url'] as string;

    const authAlgo = request.headers['paypal-auth-algo'] as string;

    const transmissionSig = request.headers[
      'paypal-transmission-sig'
    ] as string;

    const webhookId = this.webhookPayPalId; // Замените на ваш ID вебхука

    const webhookEvent = data;

    const webhookEventBody = JSON.stringify(webhookEvent);

    const expectedSignature = crypto
      .createHmac('sha256', webhookId)
      .update(transmissionId + transmissionTime + webhookEventBody)
      .digest('base64');

    if (expectedSignature !== transmissionSig) {
      return false;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}v1/notifications/verify-webhook-signature`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            transmission_id: transmissionId,
            transmission_time: transmissionTime,
            cert_url: certUrl,
            auth_algo: authAlgo,
            transmission_sig: transmissionSig,
            webhook_id: webhookId,
            webhook_event: webhookEvent,
          }),
        },
      );

      const responseData = await response.json();
      return responseData.verification_status === 'SUCCESS';
    } catch (error) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(error);
      }
      return false;
    }
  }
}
