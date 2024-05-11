import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

import { IsEmailAlreadyExist } from '../../../../infrastructure/decorators/unique-email.decorator';
import {
  emailIsIncorrect,
  emailNotUnique,
  maxChar20,
  maxChar30,
  minChar6,
  passwordIsIncorrect,
  usernameIsIncorrect,
  usernameNotUnique,
} from '../../../../base/constants/constants';
import { IsUsernameAlreadyExist } from '../../../../infrastructure/decorators/unique-username.decorator';

export class UserAuthInputModel {
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
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    type: String,
    minLength: 6,
    maxLength: 20,
    pattern:
      '(?=.*[a-z])(?=.*[A-Z])(?=.*[!\\"#$%&\'()*+,\\-./:;<=>?@[\\\\\\]^_`{|}~])',
  })
  @MinLength(6, { message: minChar6 })
  @MaxLength(20, { message: maxChar20 })
  @Matches(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*[!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/,
    {
      message: passwordIsIncorrect,
    },
  )
  @IsNotEmpty()
  password: string;

  @ApiProperty({ type: String, format: 'email' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: emailIsIncorrect,
  })
  @IsEmailAlreadyExist({ message: emailNotUnique })
  @IsNotEmpty()
  email: string;
}
