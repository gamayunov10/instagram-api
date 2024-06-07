import { Injectable, Logger } from '@nestjs/common';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

import { UploadFileRequest } from '../../../../../../libs/common/base/user/upload-file-request';
import { FileSaveResponse } from '../../ts/types/file-save-response.type';

@Injectable()
export class S3Adapter {
  s3Client: S3Client;
  private readonly bucketName: string;

  private readonly logger = new Logger(S3Adapter.name);

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>('BUCKET_NAME');

    this.s3Client = new S3Client({
      region: 'eu-east-1',
      endpoint: this.configService.get<string>('S3_DOMAIN'),
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('S3_SECRET_ACCESS_KEY'),
      },
    });
  }

  getFileUrl(url: string) {
    const base = this.configService.get<string>(
      'S3_BUCKET_NAME_PLUS_S3_DOMAIN',
    );

    return `${base}${url}`;
  }

  async saveUserPhoto({
    userId,
    buffer,
    format,
    fileType,
  }: UploadFileRequest): Promise<FileSaveResponse> {
    const key = `content/users/${userId}/${randomUUID()}/${fileType}.${format}`;
    const extractedBuffer = Buffer.from(buffer);

    const bucketParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: extractedBuffer,
      ContentType: `image/${format}`,
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      const uploadResult = await this.s3Client.send(command);

      return {
        url: key,
        fileId: uploadResult.ETag,
      };
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }

      throw e;
    }
  }

  async deleteUserPhoto(key: string) {
    const bucketParams = { Bucket: this.bucketName, Key: key };

    try {
      return await this.s3Client.send(new DeleteObjectCommand(bucketParams));
    } catch (e) {
      if (this.configService.get('ENV') === 'DEVELOPMENT') {
        this.logger.error(e);
      }

      throw e;
    }
  }
}
