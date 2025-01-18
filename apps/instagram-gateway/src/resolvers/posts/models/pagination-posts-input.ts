import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, Max, Min } from 'class-validator';

import { SortDirection } from '../../../base/enums/sort/sort.direction.enum';
import { PostSortFields } from '../../../base/enums/sort/post/post.sort.fields.enum';

@InputType()
export class PaginationInputPosts {
  @Min(1, { message: 'Page must be greater than or equal to 1' })
  @Field(() => Int, { defaultValue: 1 })
  page: number = 1;

  @Min(1, { message: 'Page size must be greater than or equal to 1' })
  @Max(8, { message: 'Page size must be less than or equal to 8' })
  @Field(() => Int, { defaultValue: 8 })
  pageSize: number = 8;

  @IsEnum(PostSortFields, {
    message: 'sortField must be either createdAt or updatedAt or authorId',
  })
  @Field(() => PostSortFields, { defaultValue: PostSortFields.CREATED_AT })
  sortField: PostSortFields = PostSortFields.CREATED_AT;

  @IsEnum(SortDirection, {
    message: 'sortOrder must be either ASC or DESC',
  })
  @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
  sortDirection: SortDirection = SortDirection.ASC;
}
