import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { maxChar300, minChar1 } from '../../../../base/constants/constants';

export class CommentInputModel {
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

  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  postId: string;

  @ApiProperty({
    type: String,
    description: 'This field is optional, only needed for replies',
    required: false,
  })
  @IsString()
  @IsOptional()
  parentId?: string;
}
