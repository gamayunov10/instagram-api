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
        where: { id, deletedAt: null },
        include: { images: true },
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
      return await this.prismaClient.post.findFirst({
        where: { id, deletedAt: null },
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

  async findPostsByQueryAndUserId(userId: string, query: PostQueryModel) {
    try {
      return await this.prismaClient.post.findMany({
        where: { authorId: userId, deletedAt: null },
        orderBy: { [query.sortField]: query.sortDirection },
        skip: Number(query.skip),
        take: Number(query.take),
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

  async findPostsByQuery(query: PostQueryModel) {
    try {
      return await this.prismaClient.post.findMany({
        where: { deletedAt: null },
        orderBy: { [query.sortField]: query.sortDirection },
        skip: Number(query.skip),
        take: Number(query.take),
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

  async findPostByPostIdAndUserId(postId: string, userId: string) {
    try {
      return this.prismaClient.post.findUnique({
        where: { id: postId, authorId: userId, deletedAt: null },
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
    }
  }

  private async postMapper(data): Promise<PostViewModel> {
    return {
      id: data.id,
      description: data.description,
      authorId: data.authorId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      images: data.images.map((image) => ({
        imageId: image.imageId,
      })),
    };
  }
}
