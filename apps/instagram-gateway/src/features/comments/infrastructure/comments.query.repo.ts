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
      include: { author: true, post: true }, // Including the author to check later
    });
  }

  async findCommentsByPostId(
    postId: string,
    query: CommentQueryModel,
    userId: string | null,
  ): Promise<{ comments: Comment[]; totalCount: number }> {
    try {
      const { page, pageSize, sortField, sortDirection } = query;

      let userComments = [];
      let userCommentsCount = 0;

      if (userId) {
        userComments = await this.prismaClient.comment.findMany({
          where: { postId, authorId: userId, isDeleted: false, parentId: null },
          include: { author: true },
          orderBy: { [sortField]: sortDirection },
        });

        userCommentsCount = userComments.length;
      }

      const skip = Math.max(
        0,
        Number(pageSize) * (Number(page) - 1) - userCommentsCount,
      );

      const whereFilter: any = {
        postId,
        isDeleted: false,
        parentId: null,
      };

      if (userId) {
        whereFilter.NOT = { authorId: userId };
      }

      const otherComments = await this.prismaClient.comment.findMany({
        where: whereFilter,
        include: { author: true },
        orderBy: { [sortField]: sortDirection },
        skip: skip,
        take: Number(pageSize) - userCommentsCount, // Оставшееся место для комментариев
      });

      const totalCount = await this.prismaClient.comment.count({
        where: { postId, isDeleted: false, parentId: null },
      });

      const comments = [...userComments, ...otherComments];

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
        include: { author: true },
      });

      const totalCount = result.length;
      const skip = Number(query.pageSize) * (Number(query.page) - 1);

      const replies = await this.prismaClient.comment.findMany({
        where: { parentId: commentId, isDeleted: false },
        include: { author: true },
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
