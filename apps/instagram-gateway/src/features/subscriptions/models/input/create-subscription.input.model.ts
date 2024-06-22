import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNumber, IsOptional } from 'class-validator';

import { SubscriptionTime } from '../../../../../../../libs/common/base/ts/enums/subscription-time.enum';
import { PaymentType } from '../../../../../../../libs/common/base/ts/enums/payment-type.enum';

export class CreateSubscriptionInputModel {
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

  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    type: Boolean,
    required: false,
    description: `Default value false`,
  })
  @IsOptional()
  @IsBoolean()
  autoRenewal?: boolean = false;
}
