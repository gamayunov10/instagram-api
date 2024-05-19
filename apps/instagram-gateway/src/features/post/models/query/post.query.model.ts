import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PostSortFields } from '../../../../base/enums/sort/post/post.sort.fields.enum';
import { SortDirection } from '../../../../base/enums/sort/sort.direction.enum';
import { IsValidNumber } from '../../../../infrastructure/decorators/is-nan.decorator';

export class PostQueryModel {
  @ApiProperty({
    description: `Sort direction: ${SortDirection.ASC}, ${SortDirection.DESC}`,
    default: SortDirection.ASC,
    required: false,
  })
  @IsIn([SortDirection.ASC, SortDirection.DESC])
  @IsOptional()
  sortDirection?: string = SortDirection.ASC;

  @ApiProperty({
    description: `Sort fields: ${PostSortFields.CREATED_AT}, ${PostSortFields.AUTHOR_ID}, ${PostSortFields.UPDATED_AT}`,
    default: PostSortFields.CREATED_AT,
    required: false,
  })
  @IsIn([
    PostSortFields.CREATED_AT,
    PostSortFields.AUTHOR_ID,
    PostSortFields.UPDATED_AT,
  ])
  @IsOptional()
  sortField?: string = PostSortFields.CREATED_AT;

  @ApiProperty({ default: 0, required: false })
  @IsString()
  @IsValidNumber()
  @IsOptional()
  skip?: string = '0';

  @ApiProperty({ default: 8, required: false })
  @IsString()
  @IsValidNumber()
  @IsOptional()
  take?: string = '8';
}
