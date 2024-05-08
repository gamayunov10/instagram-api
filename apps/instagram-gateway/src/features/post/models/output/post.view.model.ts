import { ApiProperty } from '@nestjs/swagger';

import { PostImageViewModel } from './post-images.view.model';

export class PostViewModel {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  description: string;

  @ApiProperty({
    type: String,
  })
  authorId: string;

  @ApiProperty({
    type: Array,
  })
  images: PostImageViewModel[];
}
