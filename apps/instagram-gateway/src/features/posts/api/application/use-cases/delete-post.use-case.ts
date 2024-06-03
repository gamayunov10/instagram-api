import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsRepository } from '../../../infrastructure/posts.repo';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import {
  postIdField,
  postNotFound,
  userIdField,
  userNotFound,
} from '../../../../../base/constants/constants';
import { UsersQueryRepository } from '../../../../users/infrastructure/users.query.repo';
import { PostsQueryRepository } from '../../../infrastructure/posts.query.repo';

export class DeletePostCommand {
  constructor(
    public userId: string,
    public postId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private readonly postsRepo: PostsRepository,
    private readonly postsQueryRepo: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute({ userId, postId }: DeletePostCommand) {
    const user = await this.usersQueryRepository.findUserById(userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.Unauthorized,
        field: userIdField,
        message: userNotFound,
      };
    }

    const post = await this.postsQueryRepo.findPostById(postId);

    if (!post) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIdField,
        message: postNotFound,
      };
    }

    if (post.authorId !== userId) {
      return {
        data: false,
        code: ResultCode.Forbidden,
      };
    }

    const result: boolean = await this.postsRepo.deletePost(userId, postId);

    if (!result) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIdField,
        message: postNotFound,
      };
    }

    return {
      data: true,
      code: ResultCode.Success,
      res: post,
    };
  }
}
