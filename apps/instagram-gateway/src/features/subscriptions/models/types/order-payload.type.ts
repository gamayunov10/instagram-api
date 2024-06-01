import { PaymentIds } from '../../../../../../../libs/common/base/ts/enums/payment-ids.enum';

export type OrderPayloadType = {
  userId: string;
  productId: PaymentIds;
  price: number;
  paymentId: string;
};
