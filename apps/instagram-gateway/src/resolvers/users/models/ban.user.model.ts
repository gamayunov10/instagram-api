import { Field, ObjectType } from '@nestjs/graphql';

import { DateTimeScalar } from '../../../base/custom-scalar- gql/date.time.scalar';

@ObjectType()
export class UserBan {
  @Field()
  reason: string;

  @Field(() => DateTimeScalar)
  createdAt: Date;
}
