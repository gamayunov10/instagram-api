import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UsersQueryRepository } from '../../../../user/infrastructure/users.query.repo';
import { ExceptionResultType } from '../../../../../base/types/exception.type';
import {
  userIdField,
  userNotFound,
} from '../../../../../base/constants/constants';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import { PostsQueryRepository } from '../../../infrastructure/posts.query.repo';

export class PostViewCommand {
  constructor(
    public postId: string,
    public userId: string,
  ) {}
}

@QueryHandler(PostViewCommand)
export class PostViewUseCase implements IQueryHandler<PostViewCommand> {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(query: PostViewCommand): Promise<ExceptionResultType<boolean>> {
    const user = await this.usersQueryRepository.findUserById(query.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIdField,
        message: userNotFound,
      };
    }

    const post = await this.postsQueryRepository.findPostById(query.postId);

    return {
      data: true,
      code: ResultCode.Success,
      response: post,
    };
  }
}
