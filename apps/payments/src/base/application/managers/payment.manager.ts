import { PaymentType } from '../../../../../../libs/common/base/ts/enums/payment-type.enum';
import { MakePaymentRequest } from '../../../../../../libs/common/base/subscriptions/make-payment-request';
import { StripeAdapter } from '../adapters/stripe.adapter';

export class PaymentManager {
  constructor() {}
  async makePayment(payment: MakePaymentRequest) {
    // if (payment.paymentType === PaymentType.PAYPAL) {
    //   return await this.paypalAdapter.createPayment(payment);
    // }

    if (payment.paymentType === PaymentType.STRIPE) {
      const stripeAdapter = new StripeAdapter();
      return await stripeAdapter.makePayment(payment);
    }
  }
}
