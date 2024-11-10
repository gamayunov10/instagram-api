import { Field, Int, ObjectType } from '@nestjs/graphql';

import { FileModel } from './file-model';

@ObjectType()
export class PaginatedPostsImagesModel {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  pagesCount: number;

  @Field(() => Int)
  totalCount: number;

  @Field(() => [FileModel])
  items: FileModel[];
}
