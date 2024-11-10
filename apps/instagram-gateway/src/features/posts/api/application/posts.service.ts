import { Injectable } from '@nestjs/common';

import { PostsQueryRepository } from '../../infrastructure/posts.query.repo';
import { FileServiceAdapter } from '../../../../base/application/adapters/file-service.adapter';
import { PaginatedPostsImagesModel } from '../../../../resolvers/posts/models/paginated-posts-images.model';
import { Paginator } from '../../../../base/pagination/paginator';
import { PaginatedPostsModel } from '../../../../resolvers/posts/models/paginated-posts.model';
import { PaginationInputPosts } from '../../../../resolvers/posts/models/pagination-posts-input';

@Injectable()
export class PostsService {
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private readonly fileServiceAdapter: FileServiceAdapter,
  ) {}
  async getPostsImagesByUser(
    userId: string,
    paginationPosts: PaginationInputPosts,
  ): Promise<PaginatedPostsImagesModel> {
    const postsImages = await this.fileServiceAdapter.getPostsImagesByUser(
      userId,
      paginationPosts,
    );

    return postsImages.res;
  }

  async findPostsByQuery(
    paginationPosts: PaginationInputPosts,
  ): Promise<PaginatedPostsModel> {
    const posts =
      await this.postsQueryRepository.findPostsByQuery(paginationPosts);
    if (posts.posts.length === 0) {
      return {
        page: Number(paginationPosts.page),
        pageSize: Number(paginationPosts.pageSize),
        pagesCount: 0,
        totalCount: 0,
        items: [],
      };
    }

    return Paginator.paginate({
      pageNumber: paginationPosts.page,
      pageSize: paginationPosts.pageSize,
      totalCount: posts.totalCount,
      items: posts.posts,
    });
  }
  async getImageIdsByPostIds(postIds: string[]): Promise<any> {
    return this.postsQueryRepository.getImageIdsByPostIds(postIds);
  }
}
