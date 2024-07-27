import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UsersQueryRepository } from '../../../../../users/infrastructure/users.query.repo';
import { ExceptionResultType } from '../../../../../../base/types/exception.type';
import {
  userIdField,
  userNotFound,
} from '../../../../../../base/constants/constants';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import { PostsQueryRepository } from '../../../../infrastructure/posts.query.repo';
import { FileServiceAdapter } from '../../../../../../base/application/adapters/file-service.adapter';
import { PostQueryModel } from '../../../../models/query/post.query.model';
import { Paginator } from '../../../../../../base/pagination/paginator';

export class PostsGetCommand {
  constructor(
    public userId: string,
    public queryQueryModel: PostQueryModel,
  ) {}
}

@QueryHandler(PostsGetCommand)
export class PostsGetUseCase implements IQueryHandler<PostsGetCommand> {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly fileServiceAdapter: FileServiceAdapter,
  ) {}

  async execute(query: PostsGetCommand): Promise<ExceptionResultType<boolean>> {
    const user = await this.usersQueryRepository.findUserById(query.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIdField,
        message: userNotFound,
      };
    }

    const resultPosts =
      await this.postsQueryRepository.findPostsByQueryAndUserId(
        query.userId,
        query.queryQueryModel,
      );

    const posts = resultPosts.posts;

    if (posts.length === 0) {
      return {
        data: true,
        code: ResultCode.Success,
        response: Paginator.paginate({
          pageNumber: Number(query.queryQueryModel.page),
          pageSize: Number(query.queryQueryModel.pageSize),
          totalCount: 0,
          items: [],
        }),
      };
    }
    const items = await Promise.all(
      posts.map(async (p) => await this.postMapper(p)),
    );

    const resultResponse = Paginator.paginate({
      pageNumber: Number(query.queryQueryModel.page),
      pageSize: Number(query.queryQueryModel.pageSize),
      totalCount: resultPosts.totalCount,
      items: items,
    });

    return {
      data: true,
      code: ResultCode.Success,
      response: resultResponse,
    };
  }

  private async postMapper(p) {
    const urls =
      p.images.length === 0
        ? []
        : await Promise.all(
            p.images.map(
              async (i) =>
                await this.fileServiceAdapter.getFileUrlByFileId(i.imageId),
            ),
          );

    return {
      id: p.id,
      description: p.description,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      authorId: p.authorId,
      username: p.author.username,
      images: urls,
    };
  }
}
