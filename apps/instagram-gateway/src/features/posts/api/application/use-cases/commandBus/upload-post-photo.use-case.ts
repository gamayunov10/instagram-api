import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import sharp from 'sharp';

import { UserImageInputModel } from '../../../../../users/models/input/user.image.input.model';
import { PostImageInputModel } from '../../../../models/input/post.image.input.model';
import { FileServiceAdapter } from '../../../../../../base/application/adapters/file-service.adapter';
import { UsersQueryRepository } from '../../../../../users/infrastructure/users.query.repo';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import {
  fileField,
  invalidUserPhoto,
  userIdField,
  userNotFound,
} from '../../../../../../base/constants/constants';
import { UploadFileRequest } from '../../../../../../../../../libs/common/base/user/upload-file-request';
import { FileType } from '../../../../../../../../../libs/common/base/ts/enums/file-type.enum';

export class UploadPostPhotoCommand {
  constructor(public data: PostImageInputModel) {}
}

@CommandHandler(UploadPostPhotoCommand)
export class UploadPostPhotoUseCase
  implements ICommandHandler<UploadPostPhotoCommand>
{
  logger = new Logger(UploadPostPhotoUseCase.name);

  constructor(
    private readonly fileServiceAdapter: FileServiceAdapter,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute({ data }: UploadPostPhotoCommand) {
    const user = await this.usersQueryRepository.findUserById(data.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.Unauthorized,
        field: userIdField,
        message: userNotFound,
      };
    }

    const metadata = await sharp(data.buffer).metadata();

    const resultValidate = await this.validateImage(metadata);

    if (!resultValidate.data) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: fileField,
        message: invalidUserPhoto,
      };
    }

    const payload = await this.getPayload(data, metadata);
    const uploadResult = await this.fileServiceAdapter.upload(payload);

    if (!uploadResult.data) {
      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: fileField,
        message: 'Upload error',
      };
    }

    return {
      data: true,
      code: ResultCode.Success,
      res: uploadResult.res,
    };
  }

  private async validateImage(metadata: sharp.Metadata) {
    const availableFileTypes = ['png', 'jpeg'];

    if (!availableFileTypes.includes(metadata.format!)) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: fileField,
        message: invalidUserPhoto,
      };
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }

  private async getPayload(
    data: UserImageInputModel,
    metadata: sharp.Metadata,
  ): Promise<UploadFileRequest> {
    return {
      userId: data.userId,
      originalname: data.originalname,
      buffer: data.buffer,
      format: metadata.format,
      fileType: FileType.PostImage,
      ownerId: data.userId,
    };
  }
}
