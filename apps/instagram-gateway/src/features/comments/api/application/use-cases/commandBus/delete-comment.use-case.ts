import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import {
  commentIdField,
  commentNotFound,
} from '../../../../../../base/constants/constants';
import { CommentsQueryRepo } from '../../../../infrastructure/comments.query.repo';
import { CommentService } from '../../comments.service';

export class DeleteCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    private readonly commentsQueryRepo: CommentsQueryRepo,
    private readonly commentsService: CommentService,
  ) {}

  async execute({ commentId, userId }: DeleteCommentCommand) {
    const comment = await this.commentsQueryRepo.findCommentById(commentId);
    if (!comment) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: commentIdField,
        message: commentNotFound,
      };
    }

    if (comment.authorId !== userId && comment.post.authorId !== userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const deletedComment =
      await this.commentsService.deleteCommentId(commentId);

    if (!deletedComment) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: commentIdField,
        message: commentNotFound,
      };
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
