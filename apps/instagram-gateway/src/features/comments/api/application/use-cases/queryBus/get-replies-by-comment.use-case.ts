import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ExceptionResultType } from '../../../../../../base/types/exception.type';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import { Paginator } from '../../../../../../base/pagination/paginator';
import { CommentService } from '../../comments.service';
import { RepliesQueryModel } from '../../../../models/query/replies.query.model';
import {
  commentIdField,
  commentNotFound,
} from '../../../../../../base/constants/constants';

export class RepliesByCommentGetCommand {
  constructor(
    public commentId: string,
    public queryModel: RepliesQueryModel,
  ) {}
}

@QueryHandler(RepliesByCommentGetCommand)
export class RepliesByCommentGetUseCase
  implements IQueryHandler<RepliesByCommentGetCommand>
{
  constructor(private readonly commentsService: CommentService) {}

  async execute(
    query: RepliesByCommentGetCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const comment = await this.commentsService.findCommentById(query.commentId);
    if (!comment) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: commentIdField,
        message: commentNotFound,
      };
    }

    const resultReplies = await this.commentsService.findRepliesByCommentId(
      query.commentId,
      query.queryModel,
    );

    const replies = resultReplies.replies;

    if (replies.length === 0) {
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
      totalCount: resultReplies.totalCount,
      items: replies,
    });

    return {
      data: true,
      code: ResultCode.Success,
      response: resultResponse,
    };
  }
}
