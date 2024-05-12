import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../base/enums/node-env.enum';
import { PostViewModel } from '../models/output/post.view.model';

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
        where: { id },
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

  private async postMapper(data): Promise<PostViewModel> {
    return {
      id: data.id,
      description: data.description,
      authorId: data.authorId,
      images: data.images.map((image) => ({
        imageId: image.imageId,
      })),
    };
  }
}
