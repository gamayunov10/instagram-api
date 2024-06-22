import { User } from '@prisma/client';

import { PaymentType } from '../ts/enums/payment-type.enum';
import { SubscriptionTime } from '../ts/enums/subscription-time.enum';

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
  interval: SubscriptionTime;
  user: User;
}
