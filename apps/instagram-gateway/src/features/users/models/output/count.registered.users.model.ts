import { ApiProperty } from '@nestjs/swagger';

export class CountRegisteredUsers {
  @ApiProperty({
    type: Number,
  })
  totalCount: number;
}
