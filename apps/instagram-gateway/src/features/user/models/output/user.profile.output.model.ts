import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

import { IsNotEmptyString } from '../../../../infrastructure/decorators/is-not-empty-string.decorator';
import { AgePolicy } from '../../../../infrastructure/decorators/age-policy.decorator';

import { AvatarViewModel } from './avatar.view.model';

export class UserProfileOutputModel {
  @ApiProperty({
    type: String,
  })
  username: string;

  @ApiProperty({
    type: String,
  })
  firstName: string;

  @ApiProperty({
    type: String,
  })
  lastName: string;

  @ApiProperty({
    type: String,
    example: 'Date in the format 01.12.1990',
    required: false,
  })
  @AgePolicy()
  @Matches(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/, {
    message: 'format is invalid',
  })
  @IsOptional()
  dateOfBirth?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsNotEmptyString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsOptional()
  aboutMe?: string;

  @ApiProperty({
    type: Object(AvatarViewModel || null),
  })
  avatar: AvatarViewModel | null;
}
