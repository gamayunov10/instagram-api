import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Types } from 'mongoose';

import { FileRepository } from '../../../infrastructure/file.repo';
import { FileQueryRepository } from '../../../infrastructure/file.query.repo';
import { ResultCode } from '../../../../../../../instagram-gateway/src/base/enums/result-code.enum';
import { S3Adapter } from '../../../../../base/application/adapters/s3.adapter';

export class DeleteUserPhotoCommand {
  constructor(public fileId: string) {}
}

@CommandHandler(DeleteUserPhotoCommand)
export class DeleteUserPhotoUseCases
  implements ICommandHandler<DeleteUserPhotoCommand>
{
  constructor(
    private readonly s3Adapter: S3Adapter,
    private readonly fileRepository: FileRepository,
    private readonly fileQueryRepository: FileQueryRepository,
  ) {}

  async execute({ fileId }: DeleteUserPhotoCommand) {
    const objectId = new Types.ObjectId(fileId);
    const file = await this.fileQueryRepository.findFileById(objectId);

    if (!file) {
      return {
        data: false,
      };
    }

    await this.s3Adapter.deleteUserPhoto(file.url);

    await this.fileRepository.deleteFile(file._id);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
