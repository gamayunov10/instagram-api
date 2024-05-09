import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches, MaxLength, MinLength } from 'class-validator';

import {
  firstNameIsIncorrect,
  lastNameIsIncorrect,
  maxChar200,
  maxChar30,
  maxChar50,
  minChar1,
  minChar6,
  usernameIsIncorrect,
} from '../../../../base/constants/constants';
import { IsNotEmptyString } from '../../../../infrastructure/decorators/is-not-empty-string.decorator';
import { AgePolicy } from '../../../../infrastructure/decorators/age-policy.decorator';

export class UserProfileInputModel {
  @ApiProperty({
    type: String,
    minLength: 6,
    maxLength: 30,
    pattern: '^[a-zA-Z0-9_-]*$',
  })
  @MinLength(6, { message: minChar6 })
  @MaxLength(30, { message: maxChar30 })
  @Matches(/^[a-zA-Z0-9_-]*$/, {
    message: usernameIsIncorrect,
  })
  username: string;

  @ApiProperty({
    type: String,
    minLength: 1,
    maxLength: 50,
    pattern: '^[A-Za-zА-Яа-я]*$',
  })
  @MinLength(1, { message: minChar1 })
  @MaxLength(50, { message: maxChar50 })
  @Matches(/^[A-Za-zА-Яа-я]*$/, {
    message: firstNameIsIncorrect,
  })
  firstName: string;

  @ApiProperty({
    type: String,
    minLength: 1,
    maxLength: 50,
    pattern: '^[A-Za-zА-Яа-я]*$',
  })
  @MinLength(1, { message: minChar1 })
  @MaxLength(50, { message: maxChar50 })
  @Matches(/^[A-Za-zА-Яа-я]*$/, {
    message: lastNameIsIncorrect,
  })
  lastName: string;

  @ApiProperty({
    type: String,
    example: '01.07.1990',
    required: false,
  })
  @AgePolicy()
  @Matches(/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/, {
    message: 'format is invalid',
  })
  @IsOptional()
  dateOfBirth?: Date;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsNotEmptyString()
  @IsOptional()
  city?: string;

  @ApiProperty({
    type: String,
    minLength: 0,
    maxLength: 200,
    required: false,
  })
  @MaxLength(200, { message: maxChar200 })
  @IsOptional()
  aboutMe?: string;
}
