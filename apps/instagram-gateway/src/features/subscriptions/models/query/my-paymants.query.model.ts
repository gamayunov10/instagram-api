import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { IsValidNumber } from '../../../../infrastructure/decorators/is-nan.decorator';
import {
  pageNumberDefault,
  pageSizeDefault,
} from '../../../../base/constants/constants';

export class MyPaymentsQueryModel {
  @ApiProperty({ default: 1, required: false })
  @IsString()
  @IsValidNumber()
  @IsOptional()
  page?: string = pageNumberDefault;

  @ApiProperty({ default: pageSizeDefault, required: false })
  @IsString()
  @IsValidNumber()
  @IsOptional()
  pageSize?: string = pageSizeDefault;
}
