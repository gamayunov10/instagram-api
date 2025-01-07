import { IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { SortDirection } from '../../../../base/enums/sort/sort.direction.enum';
import {
  pageNumberDefault,
  pageSizeDefault,
} from '../../../../base/constants/constants';
import { IsStandardInteger } from '../../../../infrastructure/decorators/is-standard-integer.decorator';
import { TransformToInteger } from '../../../../infrastructure/decorators/transform-to-integer.decorator';
import { CommentSortFields } from '../../../../base/enums/sort/comment/comment.sort.fields.enum';

export class RepliesQueryModel {
  @ApiProperty({
    default: SortDirection.DESC,
    enum: SortDirection,
    required: false,
  })
  @IsIn([SortDirection.ASC, SortDirection.DESC])
  @IsOptional()
  sortDirection?: string = SortDirection.DESC;

  @ApiProperty({
    default: CommentSortFields.CREATED_AT,
    enum: CommentSortFields,
    required: false,
  })
  @IsIn([CommentSortFields.CREATED_AT, CommentSortFields.UPDATED_AT])
  @IsOptional()
  sortField?: string = CommentSortFields.CREATED_AT;

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
