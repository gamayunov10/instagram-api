import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

import { AvatarViewModel } from './avatar.view.model';
import { PublicationsViewModel } from './publications.view.model';

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
    type: Array(PublicationsViewModel || []),
  })
  publications: PublicationsViewModel[] | [];

  @ApiProperty({
    type: Object(AvatarViewModel || null),
  })
  avatar: AvatarViewModel | null;
}
