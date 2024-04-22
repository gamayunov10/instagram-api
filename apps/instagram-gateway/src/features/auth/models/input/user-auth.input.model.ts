import { ApiProperty } from '@nestjs/swagger';
import { Matches, MaxLength, MinLength } from 'class-validator';

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
  username: string;

  @ApiProperty({
    type: String,
    minLength: 6,
    maxLength: 20,
    pattern: '^[0-9A-Za-z!"#$%&\'()*+,-./:;<=>?@[\\\\\\]^_`{|}~]*$',
  })
  @MinLength(6, { message: minChar6 })
  @MaxLength(20, { message: maxChar20 })
  @Matches(/^[0-9A-Za-z!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]*$/, {
    message: passwordIsIncorrect,
  })
  password: string;

  @ApiProperty({ type: String, format: 'email' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: emailIsIncorrect,
  })
  @IsEmailAlreadyExist({ message: emailNotUnique })
  email: string;
}
