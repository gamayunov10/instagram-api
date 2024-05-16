import { ApiProperty } from '@nestjs/swagger';

export class PostImageViewModel {
  @ApiProperty({
    type: String,
  })
  imageId: string;
}
