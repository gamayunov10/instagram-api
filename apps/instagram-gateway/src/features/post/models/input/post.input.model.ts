import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { maxChar500 } from '../../../../base/constants/constants';
import { IsValidArrayOfUuid } from '../../../../infrastructure/decorators/is-valid-array-of-uuid.decorator';

export class PostInputModel {
  @ApiProperty({
    type: Array,
  })
  @IsString({ each: true })
  @ArrayNotEmpty()
  @IsArray()
  @IsValidArrayOfUuid()
  images: string[];

  @ApiProperty({
    type: String,
    minLength: 0,
    maxLength: 500,
    required: false,
  })
  @MaxLength(500, { message: maxChar500 })
  @IsOptional()
  description?: string;
}
