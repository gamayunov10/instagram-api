import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { PaymentType } from '../../../../../../libs/common/base/ts/enums/payment-type.enum';
import { SubscriptionTime } from '../../../../../../libs/common/base/ts/enums/subscription-time.enum';

registerEnumType(PaymentType, { name: 'PaymentType' });
registerEnumType(SubscriptionTime, { name: 'SubscriptionTime' });

@ObjectType()
export class SubscriptionPaymentsModel {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  userName: string;

  @Field(() => PaymentType)
  paymentMethod: PaymentType;

  @Field(() => SubscriptionTime)
  type: SubscriptionTime;

  @Field()
  amount: number;

  @Field()
  currency: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  endDate: Date;
}
