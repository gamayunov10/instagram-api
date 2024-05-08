import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../base/enums/node-env.enum';
import { PostInputModel } from '../models/input/post.input.model';

@Injectable()
export class PostsRepository {
  private readonly logger = new Logger(PostsRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}

  async createPost(postInputModel: PostInputModel, userId: string) {
    try {
      const postId = await this.prismaClient.$transaction(async (prisma) => {
        const images = postInputModel.images.map((image) => ({
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

      return postId;
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
