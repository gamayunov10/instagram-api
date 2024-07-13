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
import { FileMetaResponse } from '../../../../../../../../../libs/common/base/post/file-meta-response';
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

    const imageIds = posts.flatMap((p) => p.images.map((i) => i.imageId));

    const result = await this.fileServiceAdapter.getFilesMeta(imageIds);

    if (!result.data) {
      return {
        data: false,
        code: result.code,
        field: result.field,
        message: result.message,
      };
    }

    const response =
      result.code !== ResultCode.Success
        ? await Promise.all(posts.map(async (p) => await this.postMapper(p)))
        : await Promise.all(
            posts.map(async (p) => await this.postMapper(p, result.res)),
          );

    return {
      data: true,
      code: ResultCode.Success,
      response: Paginator.paginate({
        pageNumber: Number(query.queryQueryModel.page),
        pageSize: Number(query.queryQueryModel.pageSize),
        totalCount: resultPosts.totalCount,
        items: response,
      }),
    };
  }

  private async postMapper(p, postImages?: FileMetaResponse[]) {
    let url = [];

    if (postImages) {
      url = postImages
        .filter((i) => p.images.some((img) => img.imageId === i.imageId))
        .map((i) => i.url);
    }

    return {
      id: p.id,
      description: p.description,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      authorId: p.authorId,
      username: p.author.username,
      imagesUrl: url,
    };
  }
}
