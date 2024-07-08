import { PaymentType } from '../../../../../../../libs/common/base/ts/enums/payment-type.enum';

export type PaymentTransactionPayloadType = {
  price: number;
  paymentSystem: PaymentType;
  status: string;
  url: string;
  openedPaymentData: string;
  confirmedPaymentData: any;
};
