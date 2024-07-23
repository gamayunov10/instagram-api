import { PaymentIds } from '../../../../../../../libs/common/base/ts/enums/payment-ids.enum';
import { SubscriptionTime } from '../../../../../../../libs/common/base/ts/enums/subscription-time.enum';
import { PaymentType } from '../../../../../../../libs/common/base/ts/enums/payment-type.enum';

export type OrderPayloadType = {
  userId: string;
  productId: PaymentIds;
  price: number;
  paymentId: string;
  subscriptionTime: SubscriptionTime;
  paymentSystem: PaymentType;
};
