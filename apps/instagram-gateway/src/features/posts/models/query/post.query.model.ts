import { IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PostSortFields } from '../../../../base/enums/sort/post/post.sort.fields.enum';
import { SortDirection } from '../../../../base/enums/sort/sort.direction.enum';
import {
  pageNumberDefault,
  pageSizeDefault,
} from '../../../../base/constants/constants';
import { TransformToInteger } from '../../../../infrastructure/decorators/transform-to-integer.decorator';
import { IsStandardInteger } from '../../../../infrastructure/decorators/is-standard-integer.decorator';

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

  @ApiProperty({ default: pageNumberDefault, required: false })
  @IsStandardInteger()
  @TransformToInteger()
  @IsOptional()
  page?: number = pageNumberDefault;

  @ApiProperty({ default: pageSizeDefault, required: false })
  @IsStandardInteger()
  @TransformToInteger()
  @IsOptional()
  pageSize?: number = pageSizeDefault;
}
