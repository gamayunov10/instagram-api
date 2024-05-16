import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostInputModel } from '../../../models/input/post.input.model';
import { PostsRepository } from '../../../infrastructure/posts.repo';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import {
  noneField,
  postNotSaved,
  userIdField,
  userNotFound,
} from '../../../../../base/constants/constants';
import { UsersQueryRepository } from '../../../../user/infrastructure/users.query.repo';

export class CreatePostCommand {
  constructor(
    public postInputModel: PostInputModel,
    public userId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly postsRepo: PostsRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute({ postInputModel, userId }: CreatePostCommand) {
    const user = await this.usersQueryRepository.findUserById(userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.Unauthorized,
        field: userIdField,
        message: userNotFound,
      };
    }

    const post = await this.postsRepo.createPost(postInputModel, userId);

    if (!post) {
      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: noneField,
        message: postNotSaved,
      };
    }

    return {
      data: true,
      code: ResultCode.Success,
      res: post,
    };
  }
}
