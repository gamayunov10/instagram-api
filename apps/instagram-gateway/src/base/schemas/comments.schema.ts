import { ApiProperty } from '@nestjs/swagger';

import { CommentViewModel } from '../../features/comments/models/output/comment.view.model';

import { PaginatorSchema } from './paginator.schema';

export class CommentsSchema extends PaginatorSchema {
  @ApiProperty({
    type: Array(CommentViewModel),
  })
  'items': CommentViewModel[];
}
