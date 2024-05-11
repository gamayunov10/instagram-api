import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UploadFileRequest } from '../../../../../../../../libs/common/base/user/upload-file-request';
import { UploadFileResponse } from '../../../../../../../../libs/common/base/user/upload-file-response';
import { S3Adapter } from '../../../../../base/application/adapters/s3.adapter';
import { FileRepository } from '../../../infrastructure/file.repo';
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
      originalname: payload.originalname,
      format: payload.format,
      url: uploadFileResult.url,
      fileId: uploadFileResult.fileId,
    };

    const fileEntity = new FileEntity(fileModel);

    const file = await this.fileRepository.createFile(fileEntity);

    return { fileId: file._id };
  }
}
