import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsRepository } from '../../../infrastructure/posts.repo';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import {
  postIdField,
  postNotFound,
  userIdField,
  userNotFound,
} from '../../../../../base/constants/constants';
import { UsersQueryRepository } from '../../../../user/infrastructure/users.query.repo';
import { UpdatePostModel } from '../../../models/input/update-post.model';
import { PostsQueryRepository } from '../../../infrastructure/posts.query.repo';

export class UpdatePostCommand {
  constructor(
    public updatePostModel: UpdatePostModel,
    public userId: string,
    public postId: string,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private readonly postsRepo: PostsRepository,
    private readonly postsQueryRepo: PostsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute({ updatePostModel, userId, postId }: UpdatePostCommand) {
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

    const result: boolean = await this.postsRepo.updatePost(
      updatePostModel,
      userId,
      postId,
    );

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
