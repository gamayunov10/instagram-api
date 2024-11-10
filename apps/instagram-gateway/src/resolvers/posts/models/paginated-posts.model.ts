import { Field, Int, ObjectType } from '@nestjs/graphql';

import { PostModel } from './post-model';

@ObjectType()
export class PaginatedPostsModel {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  pagesCount: number;

  @Field(() => Int)
  totalCount: number;

  @Field(() => [PostModel])
  items: PostModel[];
}
