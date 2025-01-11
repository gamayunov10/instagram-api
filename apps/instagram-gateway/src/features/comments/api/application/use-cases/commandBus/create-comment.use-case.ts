import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import {
  commentIdField,
  commentNotFound,
  postIdField,
  postNotFound,
} from '../../../../../../base/constants/constants';
import { CommentInputModel } from '../../../../models/input/comment.input.model';
import { PostsQueryRepository } from '../../../../../posts/infrastructure/posts.query.repo';
import { CommentsQueryRepo } from '../../../../infrastructure/comments.query.repo';
import { CommentService } from '../../comments.service';

export class CreateCommentCommand {
  constructor(
    public commentInputModel: CommentInputModel,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly commentsQueryRepo: CommentsQueryRepo,
    private readonly commentsService: CommentService,
  ) {}

  async execute({ commentInputModel, userId }: CreateCommentCommand) {
    const post = await this.postsQueryRepository.findPostById(
      commentInputModel.postId,
    );

    if (!post) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIdField,
        message: postNotFound,
      };
    }

    if (commentInputModel.parentId) {
      const comment = await this.commentsQueryRepo.findCommentById(
        commentInputModel.parentId,
      );
      if (!comment) {
        return {
          data: false,
          code: ResultCode.NotFound,
          field: commentIdField,
          message: commentNotFound,
        };
      }
    }
    const newComment = await this.commentsService.create(
      commentInputModel,
      userId,
    );

    if (!newComment) {
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
      res: newComment,
    };
  }
}
