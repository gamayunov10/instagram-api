import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  maxChar20,
  minChar6,
  passwordIsIncorrect,
} from '../../../base/constants/constants';

@InputType()
export class AuthLoginInput {
  @IsEmail()
  @IsNotEmpty()
  @Field()
  email: string;

  @MinLength(6, { message: minChar6 })
  @MaxLength(20, { message: maxChar20 })
  @Matches(
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!\"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])[0-9A-Za-z!\"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]+$/g,
    {
      message: passwordIsIncorrect,
    },
  )
  @IsNotEmpty()
  @Field()
  password: string;
}
