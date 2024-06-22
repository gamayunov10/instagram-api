import { PaymentType } from '../../../../../../libs/common/base/ts/enums/payment-type.enum';
import { MakePaymentRequest } from '../../../../../../libs/common/base/subscriptions/make-payment-request';
import { StripeAdapter } from '../adapters/stripe.adapter';
import { PaypalAdapter } from '../adapters/paypal.adapter';

export class PaymentManager {
  constructor() {}
  async makePayment(payment: MakePaymentRequest) {
    if (payment.paymentType === PaymentType.PAYPAL) {
      const paypalAdapter = new PaypalAdapter();
      return await paypalAdapter.createOrder(payment);
    }

    if (payment.paymentType === PaymentType.STRIPE) {
      const stripeAdapter = new StripeAdapter();
      return await stripeAdapter.makePayment(payment);
    }
  }

  async createAutoSubscription(payment: MakePaymentRequest) {
    if (payment.paymentType === PaymentType.PAYPAL) {
      const paypalAdapter = new PaypalAdapter();
      return await paypalAdapter.createSubscription(payment);
    }

    if (payment.paymentType === PaymentType.STRIPE) {
      const stripeAdapter = new StripeAdapter();
      return await stripeAdapter.createAutoSubscription(payment);
    }
  }
}
