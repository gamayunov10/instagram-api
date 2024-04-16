import { ApiProperty } from '@nestjs/swagger';
import { Matches, MaxLength, MinLength } from 'class-validator';

import {
  firstNameIsIncorrect,
  lastNameIsIncorrect,
  maxChar200,
  maxChar30,
  maxChar50,
  minChar1,
  minChar6,
  usernameIsIncorrect,
  usernameNotUnique,
} from '../../../../base/constants/constants';
import { IsUsernameAlreadyExist } from '../../../../infrastructure/decorators/unique-username.decorator';
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
  @IsUsernameAlreadyExist({ message: usernameNotUnique })
  username: string;

  @ApiProperty({
    type: String,
    minLength: 1,
    maxLength: 50,
    pattern: '^[A-Za-z]*$',
  })
  @MinLength(1, { message: minChar1 })
  @MaxLength(50, { message: maxChar50 })
  @Matches(/^[A-Za-z]*$/, {
    message: firstNameIsIncorrect,
  })
  firstName: string;

  @ApiProperty({
    type: String,
    minLength: 1,
    maxLength: 50,
    pattern: '^[A-Za-z]*$',
  })
  @MinLength(1, { message: minChar1 })
  @MaxLength(50, { message: maxChar50 })
  @Matches(/^[A-Za-z]*$/, {
    message: lastNameIsIncorrect,
  })
  lastName: string;

  @ApiProperty({
    type: String,
    example: '01.07.1990',
  })
  @AgePolicy()
  @Matches(/^\d{2}.\d{2}.\d{4}$/, {
    message: 'format is invalid',
  })
  dateOfBirth: Date;

  @ApiProperty({
    type: String,
    minLength: 0,
    maxLength: 200,
  })
  @MaxLength(200, { message: maxChar200 })
  aboutMe: string;
}
