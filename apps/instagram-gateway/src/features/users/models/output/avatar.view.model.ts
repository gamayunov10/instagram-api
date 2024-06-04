import { ApiProperty } from '@nestjs/swagger';

export class AvatarViewModel {
  @ApiProperty({
    type: String,
  })
  url: string;
}
