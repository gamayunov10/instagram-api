import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import {
  pageNumberDefault,
  pageSizeDefault,
} from '../../../../base/constants/constants';
import { IsStandardInteger } from '../../../../infrastructure/decorators/is-standard-integer.decorator';
import { TransformToInteger } from '../../../../infrastructure/decorators/transform-to-integer.decorator';

export class MyPaymentsQueryModel {
  @ApiProperty({ default: 1, required: false })
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
