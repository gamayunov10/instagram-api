import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../base/enums/node-env.enum';
import { PostViewModel } from '../models/output/post.view.model';
import { PostQueryModel } from '../models/query/post.query.model';

@Injectable()
export class PostsQueryRepository {
  private readonly logger = new Logger(PostsQueryRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}

  async findPostById(id: string): Promise<PostViewModel | null> {
    try {
      const post = await this.prismaClient.post.findUnique({
        where: { id, isDeleted: false },
        include: { images: true, author: true },
      });

      return await this.postMapper(post);
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findFirstPostById(id: string): Promise<PostViewModel | null> {
    try {
      const post = await this.prismaClient.post.findFirst({
        where: { id, isDeleted: false },
        include: { images: true, author: true },
      });
      return await this.postMapper(post);
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return null;
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findPostsByQueryAndUserId(userId: string, query: PostQueryModel) {
    try {
      const result = await this.prismaClient.post.findMany({
        where: { authorId: userId, isDeleted: false },
      });

      const totalCount = result.length;
      const skip = Number(query.pageSize) * (Number(query.page) - 1);

      const posts = await this.prismaClient.post.findMany({
        where: { authorId: userId, isDeleted: false },
        orderBy: { [query.sortField]: query.sortDirection },
        skip: skip,
        take: Number(query.pageSize),
        include: { images: true, author: true },
      });

      return {
        posts,
        totalCount,
      };
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return { posts: [], totalCount: 0 };
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findPostsByQuery(query: PostQueryModel) {
    try {
      const result = await this.prismaClient.post.findMany({
        where: { isDeleted: false },
      });

      const totalCount = result.length;
      const skip = Number(query.pageSize) * (Number(query.page) - 1);

      const posts = await this.prismaClient.post.findMany({
        where: { isDeleted: false },
        orderBy: { [query.sortField]: query.sortDirection },
        skip: skip,
        take: Number(query.pageSize),
        include: { images: true, author: true },
      });

      return {
        posts,
        totalCount,
      };
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return { posts: [], totalCount: 0 };
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findPostByPostIdAndUserId(postId: string, userId: string) {
    try {
      return this.prismaClient.post.findUnique({
        where: { id: postId, authorId: userId, isDeleted: false },
        include: { images: true },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async findPostsToDelete() {
    const deletionThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    try {
      return this.prismaClient.post.findMany({
        where: {
          isDeleted: true,
          deletedAt: {
            not: null,
            lt: deletionThreshold,
          },
        },
        include: { images: true },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }

      return null;
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  private async postMapper(data): Promise<PostViewModel> {
    return {
      id: data.id,
      description: data.description,
      authorId: data.authorId,
      username: data.author.username,
      avatar: { url: data.author.avatarURL },
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      images: data.images.map((image) => ({
        imageId: image.imageId,
      })),
    };
  }
}
