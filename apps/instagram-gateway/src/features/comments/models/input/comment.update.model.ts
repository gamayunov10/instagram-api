import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { maxChar300, minChar1 } from '../../../../base/constants/constants';

export class CommentUpdateModel {
  @ApiProperty({
    type: String,
    minLength: 1,
    maxLength: 300,
    required: true,
  })
  @MinLength(1, { message: minChar1 })
  @MaxLength(300, { message: maxChar300 })
  @IsNotEmpty()
  @IsString()
  content: string;
}
