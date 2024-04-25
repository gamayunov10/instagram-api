import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { S3Adapter } from '../../../../../base/application/adapters/s3.adapter';
import { UploadFileRequest } from '../../../../../../../../libs/services/user/upload-file-request';
import { FileRepository } from '../../../infrastructure/file.repo';
import { UploadFileResponse } from '../../../../../../../../libs/services/user/upload-file-response';
import { IFile } from '../../../../../base/ts/interfaces/file.interface';
import { FileEntity } from '../../../entity/file.entity';

export class UploadFileCommand {
  constructor(public payload: UploadFileRequest) {}
}

@CommandHandler(UploadFileCommand)
export class UploadFileUseCase implements ICommandHandler<UploadFileCommand> {
  constructor(
    private readonly s3Adapter: S3Adapter,
    private readonly fileRepository: FileRepository,
  ) {}

  async execute({ payload }: UploadFileCommand): Promise<UploadFileResponse> {
    const uploadFileResult = await this.s3Adapter.saveUserPhoto(payload);

    const fileModel: IFile = {
      userId: payload.userId,
      fileType: payload.fileType,
      originalName: payload.originalName,
      format: payload.format,
      url: uploadFileResult.url,
      fileId: uploadFileResult.fileId,
    };

    const fileEntity = new FileEntity(fileModel);

    const file = await this.fileRepository.createFile(fileEntity);

    return { fileId: file._id };
  }
}
