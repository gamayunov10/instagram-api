import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PostSortFields } from '../../../../base/enums/sort/post/post.sort.fields.enum';
import { SortDirection } from '../../../../base/enums/sort/sort.direction.enum';
import { IsValidNumber } from '../../../../infrastructure/decorators/is-nan.decorator';
import {
  countPostsPublicPage,
  pageNumberDefault,
  pageSizeDefault,
} from '../../../../base/constants/constants';

export class PostQueryModel {
  @ApiProperty({
    default: SortDirection.DESC,
    enum: SortDirection,
    required: false,
  })
  @IsIn([SortDirection.ASC, SortDirection.DESC])
  @IsOptional()
  sortDirection?: string = SortDirection.DESC;

  @ApiProperty({
    default: PostSortFields.CREATED_AT,
    enum: PostSortFields,
    required: false,
  })
  @IsIn([
    PostSortFields.CREATED_AT,
    PostSortFields.AUTHOR_ID,
    PostSortFields.UPDATED_AT,
  ])
  @IsOptional()
  sortField?: string = PostSortFields.CREATED_AT;

  @ApiProperty({ default: 1, required: false })
  @IsString()
  @IsValidNumber()
  @IsOptional()
  page?: string = pageNumberDefault;

  @ApiProperty({ default: countPostsPublicPage, required: false })
  @IsString()
  @IsValidNumber()
  @IsOptional()
  pageSize?: string = pageSizeDefault;
}
