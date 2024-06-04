import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { maxChar500 } from '../../../../base/constants/constants';
import { IsValidArrayOfMongoIds } from '../../../../infrastructure/decorators/is-array-of-valid-mongo-ids.decorator';

export class PostInputModel {
  @ApiProperty({
    type: Array,
  })
  @IsString({ each: true })
  @ArrayNotEmpty()
  @IsArray()
  @IsValidArrayOfMongoIds()
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
