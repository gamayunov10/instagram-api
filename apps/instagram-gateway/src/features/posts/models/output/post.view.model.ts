import { ApiProperty } from '@nestjs/swagger';

import { AvatarViewModel } from '../../../users/models/output/avatar.view.model';

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
    type: Object(AvatarViewModel || null),
  })
  avatar: AvatarViewModel | null;

  @ApiProperty({
    type: String,
  })
  username: string;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;

  @ApiProperty({
    type: Array,
  })
  images: PostImageViewModel[];
}
