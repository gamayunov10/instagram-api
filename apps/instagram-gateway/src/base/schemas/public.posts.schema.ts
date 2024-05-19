import { ApiProperty } from '@nestjs/swagger';

import { PostViewModel } from '../../features/post/models/output/post.view.model';

import { PaginatorSchema } from './paginator.schema';

export class PublicPostsSchema extends PaginatorSchema {
  @ApiProperty({
    type: Array(PostViewModel),
  })
  'items': PostViewModel[];
}
