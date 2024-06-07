import { PaymentIds } from '../../../../../../../libs/common/base/ts/enums/payment-ids.enum';
import { SubscriptionTime } from '../../../../../../../libs/common/base/ts/enums/subscription-time.enum';

export type OrderPayloadType = {
  userId: string;
  productId: PaymentIds;
  price: number;
  paymentId: string;
  subscriptionTime: SubscriptionTime;
};
