import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ExceptionResultType } from '../../../../../../base/types/exception.type';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import { Paginator } from '../../../../../../base/pagination/paginator';
import { CommentQueryModel } from '../../../../models/query/comment.query.model';
import {
  postIdField,
  postNotFound,
} from '../../../../../../base/constants/constants';
import { PostsQueryRepository } from '../../../../../posts/infrastructure/posts.query.repo';
import { CommentService } from '../../comments.service';
import { CommentViewModel } from '../../../../models/output/comment.view.model';

export class CommentsByPostGetCommand {
  constructor(
    public postId: string,
    public queryModel: CommentQueryModel,
  ) {}
}

@QueryHandler(CommentsByPostGetCommand)
export class CommentsByPostGetUseCase
  implements IQueryHandler<CommentsByPostGetCommand>
{
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsService: CommentService,
  ) {}

  async execute(
    query: CommentsByPostGetCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const post = await this.postsQueryRepository.findPostById(query.postId);

    if (!post) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIdField,
        message: postNotFound,
      };
    }

    const resultComments: { comments: CommentViewModel[]; totalCount: number } =
      await this.commentsService.findCommentsByPostId(
        query.postId,
        query.queryModel,
      );

    const comments = resultComments.comments;

    if (comments.length === 0) {
      return {
        data: true,
        code: ResultCode.Success,
        response: Paginator.paginate({
          pageNumber: Number(query.queryModel.page),
          pageSize: Number(query.queryModel.pageSize),
          totalCount: 0,
          items: [],
        }),
      };
    }

    const resultResponse = Paginator.paginate({
      pageNumber: Number(query.queryModel.page),
      pageSize: Number(query.queryModel.pageSize),
      totalCount: resultComments.totalCount,
      items: comments,
    });

    return {
      data: true,
      code: ResultCode.Success,
      response: resultResponse,
    };
  }
}
