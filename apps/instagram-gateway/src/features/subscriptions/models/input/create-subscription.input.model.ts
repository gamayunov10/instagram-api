import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber } from 'class-validator';

import { SubscriptionTimeType } from '../../../../base/enums/subscription-time-type.enum';
import { PaymentType } from '../../../../base/enums/payment-type.enum';

export class CreateSubscriptionInputModel {
  @ApiProperty({
    type: String,
    enum: SubscriptionTimeType,
  })
  @IsIn([
    SubscriptionTimeType.DAY,
    SubscriptionTimeType.WEEKLY,
    SubscriptionTimeType.MONTHLY,
  ])
  typeSubscription: string;

  @ApiProperty({
    type: String,
    enum: PaymentType,
  })
  @IsIn([PaymentType.STRIPE, PaymentType.PAYPAL, PaymentType.CREDIT_CARD])
  paymentType: string;

  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    type: String,
  })
  baseUrl: string;
}
