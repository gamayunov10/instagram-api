import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UserModel } from './user.model';

@ObjectType()
export class PaginatedUserModel {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  pagesCount: number;

  @Field(() => Int)
  totalCount: number;

  @Field(() => [UserModel])
  items: UserModel[];
}
