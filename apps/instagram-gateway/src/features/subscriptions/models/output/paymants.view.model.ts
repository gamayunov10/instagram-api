import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { SubscriptionTime } from '../../../../../../../libs/common/base/ts/enums/subscription-time.enum';
import { PaymentType } from '../../../../../../../libs/common/base/ts/enums/payment-type.enum';

export class PaymentsViewModel {
  @ApiProperty({
    type: String,
  })
  userId: string;

  @ApiProperty({
    type: String,
  })
  dateOfPayment: Date;

  @ApiProperty({
    type: Number,
  })
  price: number;

  @ApiProperty({
    type: String,
    enum: SubscriptionTime,
  })
  @IsIn([
    SubscriptionTime.DAY,
    SubscriptionTime.WEEKLY,
    SubscriptionTime.MONTHLY,
  ])
  subscriptionTimeType: SubscriptionTime;

  @ApiProperty({
    type: String,
    enum: PaymentType,
  })
  @IsIn([PaymentType.STRIPE, PaymentType.PAYPAL])
  paymentType: PaymentType;
}
