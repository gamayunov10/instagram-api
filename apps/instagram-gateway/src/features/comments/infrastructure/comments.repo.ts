import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { CommentInputModel } from '../models/input/comment.input.model';
import { CommentUpdateModel } from '../models/input/comment.update.model';
import { NodeEnv } from '../../../base/enums/node-env.enum';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentsRepository {
  private readonly logger = new Logger(CommentsRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}

  async create(
    commentInputModel: CommentInputModel,
    userId: string,
  ): Promise<Comment | null> {
    try {
      return this.prismaClient.comment.create({
        data: {
          content: commentInputModel.content,
          postId: commentInputModel.postId,
          authorId: userId,
          parentId: commentInputModel.parentId || null,
        },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return null;
    }
  }

  async update(
    commentId: string,
    commentUpdateModel: CommentUpdateModel,
  ): Promise<Comment | null> {
    try {
      return this.prismaClient.comment.update({
        where: { id: commentId },
        data: commentUpdateModel,
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return null;
    }
  }

  async deleteCommentId(id: string): Promise<Comment | null> {
    try {
      return this.prismaClient.comment.delete({
        where: { id },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return null;
    }
  }
}
