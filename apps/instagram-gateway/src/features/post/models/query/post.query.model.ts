import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { PostSortFields } from '../../../../base/enums/sort/post/post.sort.fields.enum';
import { SortDirection } from '../../../../base/enums/sort/sort.direction.enum';

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
  @IsNumber()
  @IsOptional()
  skip?: number = 0;

  @ApiProperty({ default: 8, required: false })
  @IsNumber()
  @IsOptional()
  take?: number = 8;
}
