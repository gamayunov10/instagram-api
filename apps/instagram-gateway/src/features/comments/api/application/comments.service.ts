import { Injectable } from '@nestjs/common';

import { CommentsRepository } from '../../infrastructure/comments.repo';
import { CommentInputModel } from '../../models/input/comment.input.model';
import { CommentsQueryRepo } from '../../infrastructure/comments.query.repo';
import { CommentUpdateModel } from '../../models/input/comment.update.model';
import { CommentViewModel } from '../../models/output/comment.view.model';
import { Comment } from '../../entities/comment.entity';
import { CommentQueryModel } from '../../models/query/comment.query.model';
import { RepliesQueryModel } from '../../models/query/replies.query.model';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentsRepository,
    private readonly commentQueryRepo: CommentsQueryRepo,
  ) {}

  async create(
    commentInputModel: CommentInputModel,
    userId: string,
  ): Promise<CommentViewModel | null> {
    const newComment = await this.commentRepository.create(
      commentInputModel,
      userId,
    );
    return newComment ? this.mapToCommentViewModel(newComment) : null;
  }

  async findCommentById(commentId: string): Promise<CommentViewModel | null> {
    const comment = await this.commentQueryRepo.findCommentById(commentId);

    return comment ? this.mapToCommentViewModel(comment) : null;
  }

  async findCommentsByPostId(
    postId: string,
    query: CommentQueryModel,
    userId: string | null,
  ) {
    const result = await this.commentQueryRepo.findCommentsByPostId(
      postId,
      query,
      userId,
    );
    if (result.comments.length === 0) {
      return result;
    }
    const comments = result.comments.map((comment) =>
      this.mapToCommentViewModel(comment),
    );
    return { comments, totalCount: result.totalCount };
  }

  async findRepliesByCommentId(commentId: string, query: RepliesQueryModel) {
    const result = await this.commentQueryRepo.findRepliesByCommentId(
      commentId,
      query,
    );
    if (result.replies.length === 0) {
      return result;
    }
    const replies = result.replies.map((comment) =>
      this.mapToCommentViewModel(comment),
    );
    return { replies, totalCount: result.totalCount };
  }

  async updateCommentId(
    commentId: string,
    commentUpdateModel: CommentUpdateModel,
  ): Promise<CommentViewModel | null> {
    const updatedComment = await this.commentRepository.update(
      commentId,
      commentUpdateModel,
    );

    return updatedComment ? this.mapToCommentViewModel(updatedComment) : null;
  }

  async deleteCommentId(id: string) {
    return this.commentRepository.deleteCommentId(id);
  }

  private mapToCommentViewModel(comment: Comment): CommentViewModel {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: {
        id: comment.author.id,
        username: comment.author.username,
        avatarUrl: comment.author.avatarURL,
      },
      postId: comment.postId,
      parentId: comment.parentId,
    };
  }
}
