import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

import { IsNotEmptyString } from '../../../../infrastructure/decorators/is-not-empty-string.decorator';
import {
  maxChar20,
  minChar6,
  passwordIsIncorrect,
} from '../../../../base/constants/constants';

export class NewPasswordModel {
  @ApiProperty({
    type: String,
    minLength: 6,
    maxLength: 20,
    pattern:
      '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!\\"#$%&\'()*+,\\-./:;<=>?@[\\\\\\]^_`{|}~])',
  })
  @MinLength(6, { message: minChar6 })
  @MaxLength(20, { message: maxChar20 })
  @Matches(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/,
    {
      message: passwordIsIncorrect,
    },
  )
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ type: String })
  @IsNotEmptyString()
  recoveryCode: string;
}
