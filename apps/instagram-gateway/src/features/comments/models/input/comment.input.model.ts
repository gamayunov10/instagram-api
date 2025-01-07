import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { maxChar50 } from '../../../../base/constants/constants';

export class CommentInputModel {
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
