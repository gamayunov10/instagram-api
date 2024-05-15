import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { UsersQueryRepository } from '../../../../user/infrastructure/users.query.repo';
import { ExceptionResultType } from '../../../../../base/types/exception.type';
import {
  postIdField,
  postNotFound,
  userIdField,
  userNotFound,
} from '../../../../../base/constants/constants';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import { PostsQueryRepository } from '../../../infrastructure/posts.query.repo';
import { FileServiceAdapter } from '../../../../../base/application/adapters/file-service.adapter';
import { FileMetaResponse } from '../../../../../../../../libs/common/base/post/file-meta-response';
import { PostQueryModel } from '../../../models/query/post.query.model';

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

    const posts = await this.postsQueryRepository.findPostsByQuery(
      query.userId,
      query.queryQueryModel,
    );

    if (!posts || posts.length === 0) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIdField,
        message: postNotFound,
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
      response: response,
    };
  }

  private async postMapper(p, postImages?: FileMetaResponse[]) {
    let url = [];

    if (postImages) {
      url = postImages.map((i) => i.url);
    }
    return {
      id: p.id,
      description: p.description,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      authorId: p.authorId,
      imagesUrl: url,
    };
  }
}
