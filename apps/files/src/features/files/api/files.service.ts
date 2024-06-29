import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { FileQueryRepository } from '../infrastructure/file.query.repo';
import { S3Adapter } from '../../../base/application/adapters/s3.adapter';

@Injectable()
export class FilesService {
  constructor(
    private readonly fileQueryRepository: FileQueryRepository,
    private readonly s3Adapter: S3Adapter,
  ) {}
  getHello(): string {
    return 'Files started!';
  }

  async getFilesMeta(ids: string[]) {
    const files = await this.fileQueryRepository.findFilesByIds(ids);

    if (!files || files?.length === 0) {
      throw new Error('Files not found');
    }

    return files.map((file) => {
      return {
        authorId: file.userId,
        url: this.s3Adapter.getFileUrl(file.url),
        imageId: file.id,
      };
    });
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
}
