import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

import { PostsRepository } from '../../features/post/infrastructure/posts.repo';
import { PostsQueryRepository } from '../../features/post/infrastructure/posts.query.repo';
import { NodeEnv } from '../enums/node-env.enum';

import { FileServiceAdapter } from './adapters/file-service.adapter';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);
  constructor(
    private readonly postsRepo: PostsRepository,
    private readonly postsQueryRepo: PostsQueryRepository,
    private readonly fileServiceAdapter: FileServiceAdapter,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 1 * * 0') // every Sunday at 1 a.m.
  async cleanupDatabase() {
    try {
      const postsToDelete = await this.postsQueryRepo.findPostsToDelete();

      if (!postsToDelete || postsToDelete.length === 0) {
        this.logger.log('There are no posts that have been deleted');
        return true;
      }

      await this.deleteImages(postsToDelete);

      await this.deletePosts(postsToDelete);

      this.logger.log(
        `The cleanup was completed successfully. Cleaning time - ${new Date()}`,
      );
    } catch (error) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(error);
      }
    }
  }

  private async deleteImages(post) {
    // The logic of deleting images
    try {
      const imageIds = post.flatMap((p) => p.images.map((i) => i.imageId));

      for (const imageId of imageIds) {
        await this.fileServiceAdapter.deleteUserPhoto(imageId);
      }
    } catch (error) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(error);
      }
    }
  }

  private async deletePosts(postsToDelete) {
    // The logic of permanently deleting posts

    try {
      const postsId = postsToDelete.map((p) => p.id);

      for (const postId of postsId) {
        await this.postsRepo.finalDeletionPostById(postId);
      }
    } catch (error) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(error);
      }
    }
  }
}
