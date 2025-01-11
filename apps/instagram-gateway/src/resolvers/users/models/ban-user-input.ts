import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsUUID, Matches, MaxLength } from 'class-validator';

import {
  banReasonIsIncorrect,
  maxChar30,
} from '../../../base/constants/constants';

@InputType()
export class BanUserInput {
  @MaxLength(30, { message: maxChar30 })
  @Matches(/^[A-Za-zА-Яа-яЁё\s]*$/, {
    message: banReasonIsIncorrect,
  })
  @IsString()
  @Field(() => String)
  banReason: string;

  @IsUUID()
  @Field(() => String)
  userId: string;
}
