import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString, Matches } from 'class-validator';

const emailIsIncorrect = 'Email is incorrect';

export class DeleteUsersInputModel {
  @ApiProperty({ type: String, format: 'email' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    each: true,
    message: emailIsIncorrect,
  })
  @IsString({ each: true })
  @ArrayNotEmpty()
  @IsArray()
  emails: string[];
}
