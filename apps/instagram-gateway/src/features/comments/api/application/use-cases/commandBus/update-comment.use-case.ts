import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import {
  commentIdField,
  commentNotFound,
} from '../../../../../../base/constants/constants';
import { CommentsQueryRepo } from '../../../../infrastructure/comments.query.repo';
import { CommentService } from '../../comments.service';
import { CommentUpdateModel } from '../../../../models/input/comment.update.model';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public commentUpdateModel: CommentUpdateModel,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    private readonly commentsQueryRepo: CommentsQueryRepo,
    private readonly commentsService: CommentService,
  ) {}

  async execute({
    commentId,
    commentUpdateModel,
    userId,
  }: UpdateCommentCommand) {
    const comment = await this.commentsQueryRepo.findCommentById(commentId);
    if (!comment) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: commentIdField,
        message: commentNotFound,
      };
    }

    if (comment.authorId !== userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const updateComment = await this.commentsService.updateCommentId(
      commentId,
      commentUpdateModel,
    );

    if (!updateComment) {
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
      res: updateComment,
    };
  }
}
