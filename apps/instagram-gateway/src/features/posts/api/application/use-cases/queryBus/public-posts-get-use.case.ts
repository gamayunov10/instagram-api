import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ExceptionResultType } from '../../../../../../base/types/exception.type';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import { PostsQueryRepository } from '../../../../infrastructure/posts.query.repo';
import { FileServiceAdapter } from '../../../../../../base/application/adapters/file-service.adapter';
import { PostQueryModel } from '../../../../models/query/post.query.model';
import { Paginator } from '../../../../../../base/pagination/paginator';
import { countPostsPublicPage } from '../../../../../../base/constants/constants';

export class PublicPostsGetCommand {
  constructor(public queryQueryModel: PostQueryModel) {}
}

@QueryHandler(PublicPostsGetCommand)
export class PublicPostsGetUseCase
  implements IQueryHandler<PublicPostsGetCommand>
{
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly fileServiceAdapter: FileServiceAdapter,
  ) {}

  async execute(
    query: PublicPostsGetCommand,
  ): Promise<ExceptionResultType<boolean>> {
    query.queryQueryModel = {
      sortField: query.queryQueryModel.sortField,
      sortDirection: query.queryQueryModel.sortDirection,
      pageSize: countPostsPublicPage,
      page: query.queryQueryModel.page,
    };

    const result = await this.postsQueryRepository.findPostsByQuery(
      query.queryQueryModel,
    );

    if (result.posts.length === 0) {
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
      result.posts.map(async (p) => await this.postMapper(p)),
    );

    const resultResponse = Paginator.paginate({
      pageNumber: Number(query.queryQueryModel.page),
      pageSize: Number(query.queryQueryModel.pageSize),
      totalCount: result.totalCount,
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
      avatar: { url: p.author.avatarURL },
      images: urls,
    };
  }
}
