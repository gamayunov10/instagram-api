import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { Comment } from '../entities/comment.entity';
import { CommentQueryModel } from '../models/query/comment.query.model';
import { NodeEnv } from '../../../base/enums/node-env.enum';
import { RepliesQueryModel } from '../models/query/replies.query.model';

@Injectable()
export class CommentsQueryRepo {
  private readonly logger = new Logger(CommentsQueryRepo.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}

  async findCommentById(id: string): Promise<Comment | null> {
    return this.prismaClient.comment.findUnique({
      where: { id },
      include: { author: true }, // Including the author to check later
    });
  }

  async findCommentsByPostId(
    postId: string,
    query: CommentQueryModel,
  ): Promise<{ comments: Comment[]; totalCount: number }> {
    try {
      const result = await this.prismaClient.comment.findMany({
        where: { postId, isDeleted: false, parentId: null },
      });
      const totalCount = result.length;
      const skip = Number(query.pageSize) * (Number(query.page) - 1);

      const comments = await this.prismaClient.comment.findMany({
        where: { postId, isDeleted: false, parentId: null },
        orderBy: { [query.sortField]: query.sortDirection },
        skip: skip,
        take: Number(query.pageSize),
      });

      return { comments, totalCount };
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return { comments: [], totalCount: 0 };
    }
  }

  async findRepliesByCommentId(
    commentId: string,
    query: RepliesQueryModel,
  ): Promise<{ replies: Comment[]; totalCount: number }> {
    try {
      const result = await this.prismaClient.comment.findMany({
        where: { parentId: commentId, isDeleted: false },
      });

      const totalCount = result.length;
      const skip = Number(query.pageSize) * (Number(query.page) - 1);

      const replies = await this.prismaClient.comment.findMany({
        where: { parentId: commentId, isDeleted: false },
        orderBy: { [query.sortField]: query.sortDirection },
        skip: skip,
        take: Number(query.pageSize),
      });
      return { replies, totalCount };
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return { replies: [], totalCount: 0 };
    }
  }
}
