import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

import { IsEmailAlreadyExist } from '../../../../infrastructure/decorators/unique-email.decorator';
import {
  emailIsIncorrect,
  emailNotUnique,
  passwordIsIncorrect,
  usernameIsIncorrect,
  usernameNotUnique,
} from '../../../../base/constants/constants';
import { IsUsernameAlreadyExist } from '../../../../infrastructure/decorators/unique-username.decorator';

export class UserLoginInputModel {

  @ApiProperty({
    type: String
  })
  @IsNotEmpty()
  @IsString()  
  password: string;

  @ApiProperty({
    type: String
  })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: emailIsIncorrect,
  })
  @IsNotEmpty()
  @IsString()  
  email: string;
}
