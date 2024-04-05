import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class UserEmailInputModel {
  @ApiProperty({ type: String, format: 'email' })
  @IsEmail()
  email: string;
}
