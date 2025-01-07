import { ApiProperty } from '@nestjs/swagger';

export class CommentViewModel {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  content: string;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;

  @ApiProperty({
    type: String,
  })
  authorId: string;

  @ApiProperty({
    type: String,
  })
  postId: string;

  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
  })
  parentId?: string | null;
}
