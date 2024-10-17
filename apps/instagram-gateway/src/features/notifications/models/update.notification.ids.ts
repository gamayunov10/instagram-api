import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString, IsUUID } from 'class-validator';

export class UpdateNotificationIsReadDto {
  @ApiProperty({
    type: [String],
    description: 'Array of notification IDs to mark as read, maximum 10',
  })
  @IsArray()
  @IsString({ each: true })
  @IsUUID('4', { each: true })
  @ArrayMaxSize(10, { message: 'Too many IDs, maximum 10' }) // ограничение на количество элементов
  ids: string[];
}
