import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { File } from '../models/file.model';
import { FileType } from '../../../../../../libs/common/base/ts/enums/file-type.enum';
import { PaginationInputPosts } from '../../../../../instagram-gateway/src/resolvers/posts/models/pagination-posts-input';

@Injectable()
export class FileQueryRepository {
  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<File>,
  ) {}

  async findFileById(id: Types.ObjectId): Promise<File | null> {
    return this.fileModel.findById(id);
  }
  async findFileByFileId(id: string): Promise<File[]> {
    return this.fileModel.find({ fileId: id });
  }

  async findFilesByIds(ids: string[]): Promise<File[]> {
    return this.fileModel.find({ _id: { $in: ids } });
  }

  async findFilesByUserIds(userIds: string[]): Promise<File[]> {
    return this.fileModel.find({ userId: { $in: userIds } });
  }
  async findPostsImagesWithPaginationAndSortingByUser(
    userId: string,
    paginationPosts: PaginationInputPosts,
  ): Promise<{
    files: File[];
    totalCount: number;
  }> {
    const skip = (paginationPosts.page - 1) * paginationPosts.pageSize;

    const [files, totalCount] = await Promise.all([
      this.fileModel
        .find({ userId, fileType: FileType.PostImage })
        .sort({ [paginationPosts.sortBy]: paginationPosts.sortOrder })
        .skip(skip)
        .limit(paginationPosts.pageSize)
        .exec(),
      this.fileModel.countDocuments({ userId }).exec(),
    ]);

    return { files, totalCount };
  }
}
