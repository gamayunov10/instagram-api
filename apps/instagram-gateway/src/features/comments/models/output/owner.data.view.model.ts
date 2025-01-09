import { ApiProperty } from '@nestjs/swagger';

export class OwnerDataViewModel {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ type: String })
  username: string;

  @ApiProperty({ type: String })
  avatarUrl: string;
}
