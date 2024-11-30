import { Field, InputType } from '@nestjs/graphql';
import { IsString, IsUUID, MaxLength } from 'class-validator';

import { maxChar30 } from '../../../base/constants/constants';

@InputType()
export class BanUserInput {
  @MaxLength(30, { message: maxChar30 })
  @IsString()
  @Field(() => String)
  banReason: string;

  @IsUUID()
  @Field(() => String)
  userId: string;
}
