import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

import { PostsRepository } from '../../infrastructure/posts.repo';
import { PostsQueryRepository } from '../../infrastructure/posts.query.repo';
import { NodeEnv } from '../../../../base/enums/node-env.enum';
import { FileServiceAdapter } from '../../../../base/application/adapters/file-service.adapter';

@Injectable()
export class PostsCleanupService {
  private readonly logger = new Logger(PostsCleanupService.name);
  constructor(
    private readonly postsRepo: PostsRepository,
    private readonly postsQueryRepo: PostsQueryRepository,
    private readonly fileServiceAdapter: FileServiceAdapter,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 1 * * 0') // every Sunday at 1 a.m.
  async clearDeletedPostsFromDB() {
    this.logger.log('Cron job started for clearing deleted posts.');

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

      return true;
    } catch (error) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error('Error cleaning the database', error);
      }

      return false;
    }
  }

  private async deleteImages(post): Promise<void> {
    try {
      const imageIds = post.flatMap((p) => p.images.map((i) => i.imageId));

      for (const imageId of imageIds) {
        await this.fileServiceAdapter.deleteFile(imageId);
      }
    } catch (error) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error('Error when deleting images', error);
      }
    }
  }

  private async deletePosts(postsToDelete): Promise<void> {
    try {
      const postsId = postsToDelete.map((p) => p.id);

      for (const postId of postsId) {
        const result: boolean =
          await this.postsRepo.finalDeletionPostById(postId);

        if (!result) {
          if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
            this.logger.error('Post not deleted: finalDeletionPostById');
          }
        }
      }
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error('Error when deleting posts', e);
      }
    }
  }
}
