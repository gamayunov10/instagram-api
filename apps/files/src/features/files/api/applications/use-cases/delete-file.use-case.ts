import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FileRepository } from '../../../infrastructure/file.repo';
import { FileQueryRepository } from '../../../infrastructure/file.query.repo';
import { ResultCode } from '../../../../../../../instagram-gateway/src/base/enums/result-code.enum';
import { S3Adapter } from '../../../../../base/application/adapters/s3.adapter';
import { NodeEnv } from '../../../../../../../instagram-gateway/src/base/enums/node-env.enum';

export class DeleteUserPhotoCommand {
  constructor(public fileId: string) {}
}

@CommandHandler(DeleteUserPhotoCommand)
export class DeleteUserPhotoUseCases
  implements ICommandHandler<DeleteUserPhotoCommand>
{
  logger = new Logger(DeleteUserPhotoUseCases.name);

  constructor(
    private readonly s3Adapter: S3Adapter,
    private readonly fileRepository: FileRepository,
    private readonly fileQueryRepository: FileQueryRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute({ fileId }: DeleteUserPhotoCommand) {
    const objectId = new Types.ObjectId(fileId);
    const file = await this.fileQueryRepository.findFileById(objectId);

    try {
      if (!file) {
        return {
          data: false,
        };
      }

      const s3Result = await this.s3Adapter.deleteUserPhoto(file.url);
      const fileRepoResult = await this.fileRepository.deleteFile(objectId);

      if (fileRepoResult.deletedCount !== 1) {
        const retry = await this.fileRepository.deleteFile(file._id);

        if (retry.deletedCount !== 1) {
          if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
            this.logger.error(
              `fileRepositoryResult: File: ${file.url} not deleted.`,
            );
          }
        }
      }

      if (s3Result.$metadata.httpStatusCode !== 204) {
        const retry = await this.s3Adapter.deleteUserPhoto(file.url);

        if (retry.$metadata.httpStatusCode !== 204) {
          if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
            this.logger.error(
              `s3Result: File: ${file.url} not deleted. ${retry.$metadata.httpStatusCode}`,
            );
          }
        }
      }
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
