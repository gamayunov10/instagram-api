import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { FileQueryRepository } from '../infrastructure/file.query.repo';
import { S3Adapter } from '../../../base/application/adapters/s3.adapter';
import { Paginator } from '../../../../../instagram-gateway/src/base/pagination/paginator';
import { File } from '../models/file.model';
import { PaginationInputPosts } from '../../../../../instagram-gateway/src/resolvers/posts/models/pagination-posts-input';
import { FileModel } from '../../../../../instagram-gateway/src/resolvers/posts/models/file-model';

@Injectable()
export class FilesService {
  constructor(
    private readonly fileQueryRepository: FileQueryRepository,
    private readonly s3Adapter: S3Adapter,
  ) {}
  getHello(): string {
    return 'Files started!';
  }

  async getFilesByUserIds(userIds: string[]) {
    const files = await this.fileQueryRepository.findFilesByUserIds(userIds);
    return files.map((file) => {
      return {
        authorId: file.userId,
        createdAt: file.createdAt,
        fileType: file.fileType,
        url: this.s3Adapter.getFileUrl(file.url),
        imageId: file.id,
      };
    });
  }

  async getFilesMeta(ids: string[]) {
    const files = await this.fileQueryRepository.findFilesByIds(ids);

    if (!files || files?.length === 0) {
      throw new Error('Files not found');
    }

    return files.map((file) => {
      return this.filesMapper(file);
    });
  }
  async getFileMetaById(id: string) {
    const file = await this.fileQueryRepository.findFileByFileId(id);

    if (!file) {
      throw new Error('Files not found');
    }

    return file;
  }

  async getFileUrl(fileId: Types.ObjectId) {
    const file = await this.fileQueryRepository.findFileById(fileId);

    if (!file) {
      throw new Error('File not found');
    }

    return {
      authorId: file.userId,
      url: this.s3Adapter.getFileUrl(file.url),
    };
  }

  async findPostsImagesWithPaginationAndSortingByUser(
    userId: string,
    paginationPosts: PaginationInputPosts,
  ): Promise<Paginator<FileModel[]>> {
    const result =
      await this.fileQueryRepository.findPostsImagesWithPaginationAndSortingByUser(
        userId,
        paginationPosts,
      );
    if (result.files.length === 0) {
      return Paginator.paginate({
        pageNumber: paginationPosts.page,
        pageSize: paginationPosts.pageSize,
        totalCount: 0,
        items: [],
      });
    }
    const resultFiles = result.files.map((file) => {
      return this.filesMapper(file);
    });
    return Paginator.paginate({
      pageNumber: paginationPosts.page,
      pageSize: paginationPosts.pageSize,
      totalCount: result.totalCount,
      items: resultFiles,
    });
  }
  private filesMapper(file: File) {
    return {
      authorId: file.userId,
      createdAt: file.createdAt,
      fileType: file.fileType,
      url: this.s3Adapter.getFileUrl(file.url),
      imageId: file.id,
    };
  }
}
