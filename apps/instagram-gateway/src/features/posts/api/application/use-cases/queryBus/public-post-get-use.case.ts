import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ExceptionResultType } from '../../../../../../base/types/exception.type';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import { PostsQueryRepository } from '../../../../infrastructure/posts.query.repo';
import { FileServiceAdapter } from '../../../../../../base/application/adapters/file-service.adapter';
import {
  postIdField,
  postNotFound,
} from '../../../../../../base/constants/constants';

export class PublicPostGetCommand {
  constructor(public postId: string) {}
}

@QueryHandler(PublicPostGetCommand)
export class PublicPostGetUseCase
  implements IQueryHandler<PublicPostGetCommand>
{
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly fileServiceAdapter: FileServiceAdapter,
  ) {}

  async execute(
    query: PublicPostGetCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const post = await this.postsQueryRepository.findFirstPostById(
      query.postId,
    );

    if (!post) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: postIdField,
        message: postNotFound,
      };
    }

    const response = await this.postMapper(post);

    return {
      data: true,
      code: ResultCode.Success,
      response: response,
    };
  }

  private async postMapper(p) {
    const urls =
      p.images.length === 0
        ? []
        : await Promise.all(
            await p.images.map(
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
      username: p.username,
      images: urls,
    };
  }
}
