import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { maxChar50 } from '../../../../base/constants/constants';

export class CommentUpdateModel {
  @ApiProperty({
    type: String,
    minLength: 0,
    maxLength: 50,
    required: true,
  })
  @MaxLength(50, { message: maxChar50 })
  @IsNotEmpty()
  @IsString()
  content: string;
}
