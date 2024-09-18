import { ApiProperty } from '@nestjs/swagger';

export class NotificationViewModel {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  message: string;

  @ApiProperty({
    type: Boolean,
  })
  isRead: boolean;

  @ApiProperty({
    type: Date,
  })
  createdAt;

  @ApiProperty({
    type: String,
  })
  userId: string;
}
