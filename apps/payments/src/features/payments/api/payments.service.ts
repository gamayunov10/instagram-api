import { Injectable } from '@nestjs/common';

import { PaymentManager } from '../../../base/application/managers/payment.manager';
import { MakePaymentRequest } from '../../../../../../libs/common/base/subscriptions/make-payment-request';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentManager: PaymentManager) {}
  getHello(): string {
    return 'Payments started!';
  }

  async makePayment(payload: MakePaymentRequest) {
    return await this.paymentManager.makePayment(payload);
  }
}
