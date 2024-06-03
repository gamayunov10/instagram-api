import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { PostViewModel } from '../../../posts/models/output/post.view.model';

import { AvatarViewModel } from './avatar.view.model';

export class UserPublicProfileOutputModel {
  @ApiProperty({
    type: String,
  })
  username: string;

  @ApiProperty({
    type: Number,
  })
  following: number;

  @ApiProperty({
    type: Number,
  })
  followers: number;

  @ApiProperty({
    type: Number,
  })
  publicationsCount: number;

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  aboutMe: string;

  @ApiProperty({
    type: Array(PostViewModel || []),
  })
  publications: PostViewModel[] | [];

  @ApiProperty({
    type: Object(AvatarViewModel || null),
  })
  avatar: AvatarViewModel | null;
}
