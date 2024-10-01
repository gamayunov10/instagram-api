import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateNotificationIsReadDto {
  @ApiProperty({
    type: [String],
    description: 'Array of notification IDs to mark as read',
	pattern:
            '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!\\"#$%&\'()*+,\\-./:;<=>?@[\\\\\\]^_`{|}~])',
  })
  @IsArray()
  @IsString({ each: true })
  ids: string[];
}
