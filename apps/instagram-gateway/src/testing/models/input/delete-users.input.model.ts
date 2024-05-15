import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class DeleteUsersInputModel {
  @ApiProperty({
    type: Array,
  })
  @IsString({ each: true })
  @ArrayNotEmpty()
  @IsArray()
  emails: string[];
}
