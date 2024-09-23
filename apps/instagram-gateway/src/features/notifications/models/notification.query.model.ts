import { IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { SortDirection } from '../../../base/enums/sort/sort.direction.enum';
import {
  pageNumberDefault,
  pageSizeDefault,
} from '../../../base/constants/constants';
import { IsStandardInteger } from '../../../infrastructure/decorators/is-standard-integer.decorator';
import { TransformToInteger } from '../../../infrastructure/decorators/transform-to-integer.decorator';

export class NotificationQueryModel {
  @ApiProperty({
    default: SortDirection.DESC,
    enum: SortDirection,
    required: false,
  })
  @IsIn([SortDirection.ASC, SortDirection.DESC])
  @IsOptional()
  sortDirection?: string = SortDirection.DESC;

  @ApiProperty({
    default: 'createdAt',
    required: false,
  })
  @IsIn(['createdAt'])
  @IsOptional()
  sortField?: string = 'createdAt';

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
