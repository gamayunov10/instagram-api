import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

import { maxChar500 } from '../../../../base/constants/constants';

import { PostInputModel } from './post.input.model';

export class UpdatePostModel extends PartialType(PostInputModel) {
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
