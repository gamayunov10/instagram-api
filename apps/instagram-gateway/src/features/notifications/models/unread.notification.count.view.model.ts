import { ApiProperty } from '@nestjs/swagger';

export class UnreadNotificationCountViewModel {
  @ApiProperty({
    type: Number,
  })
  count: number;
}
