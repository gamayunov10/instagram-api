import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

import { maxChar500 } from '../../../../base/constants/constants';

export class UpdatePostModel {
  @ApiProperty({
    type: String,
    minLength: 0,
    maxLength: 500,
    required: false,
  })
  @MaxLength(500, { message: maxChar500 })
  @IsNotEmpty()
  description: string;
}
