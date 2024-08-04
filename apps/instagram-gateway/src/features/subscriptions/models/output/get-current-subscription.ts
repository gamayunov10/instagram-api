import { ApiProperty } from '@nestjs/swagger';

export class CurrentSubscriptionViewModel {
  @ApiProperty({
    type: String,
  })
  userId: string;

  @ApiProperty({
    type: String,
    description: 'Subscription end date',
  })
  expireAt: Date;

  @ApiProperty({
    type: String,
    description: 'The date of the next subscription payment',
  })
  nextPayment: Date;

  @ApiProperty({
    type: Boolean,
  })
  autoRenewal: boolean;

  @ApiProperty({
    type: String,
    description: 'customer ID in the payment system',
  })
  customerId: string;

  @ApiProperty({
    type: String,
    description: 'ID of the subscription in the payment system',
  })
  subscriptionId: string;
}
