import { PaymentType } from '../ts/enums/payment-type.enum';

export class MakePaymentRequest {
  paymentType: PaymentType;
  success_url: string;
  cancel_url: string;
  product_data: {
    name: string;
    description: string;
  };
  unit_amount: number;
  quantity: number;
  client_reference_id: string;
}
