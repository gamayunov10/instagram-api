import { Field, Int, ObjectType } from '@nestjs/graphql';

import { SubscriptionPaymentsModel } from './subscription.payments.model';

@ObjectType()
export class PaginatedPaymentsModel {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  pagesCount: number;

  @Field(() => Int)
  totalCount: number;

  @Field(() => [SubscriptionPaymentsModel])
  items: SubscriptionPaymentsModel[];
}
