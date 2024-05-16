import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../base/enums/node-env.enum';
import { PostInputModel } from '../models/input/post.input.model';
import { UpdatePostModel } from '../models/input/update-post.model';

@Injectable()
export class PostsRepository {
  private readonly logger = new Logger(PostsRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}

  async createPost(postInputModel: PostInputModel, userId: string) {
    try {
      return await this.prismaClient.$transaction(async (prisma) => {
        const uniqueImages = Array.from(new Set(postInputModel.images));

        const images = uniqueImages.map((image) => ({
          imageId: image,
        }));

        const createdPost = await prisma.post.create({
          data: {
            authorId: userId,
            description: postInputModel.description,
            images: {
              createMany: {
                data: images,
              },
            },
          },
        });

        return createdPost.id;
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return false;
    } finally {
      await this.prismaClient.$disconnect();
    }
  }

  async updatePost(
    updatePostModel: UpdatePostModel,
    userId: string,
    postId: string,
  ): Promise<boolean> {
    try {
      const result = await this.prismaClient.post.update({
        where: { id: postId, authorId: userId },
        data: {
          description: updatePostModel.description,
        },
      });

      return !!result;
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }

      return false;
    }
  }
  async deletePost(userId: string, postId: string): Promise<boolean> {
    try {
      const result = await this.prismaClient.$transaction(async (prisma) => {
        const deletePost = await prisma.post.update({
          where: { id: postId, authorId: userId },
          data: { deletedAt: new Date() },
        });

        return !!deletePost;
      });
      return result;
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }

      return false;
    } finally {
      await this.prismaClient.$disconnect();
    }
  }
}
