import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class SALoginInputModel {
  @ApiProperty({
    type: String,
  })
  @Field()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    type: String,
  })
  @Field()
  @IsNotEmpty()
  email: string;
}
