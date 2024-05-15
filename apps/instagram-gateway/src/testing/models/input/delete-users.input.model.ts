import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString, Matches } from 'class-validator';

export class DeleteUsersInputModel {
  @ApiProperty({ type: String, format: 'email' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    each: true,
    message: 'Email is incorrect',
  })
  @IsString({ each: true })
  @ArrayNotEmpty()
  @IsArray()
  emails: string[];
}
