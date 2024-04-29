import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import sharp from 'sharp';

import { UploadFileRequest } from '../../../../../../../../libs/common/base/user/upload-file-request';
import { FileType } from '../../../../../../../../libs/common/base/ts/enums/file-type.enum';
import { UserImageInputModel } from '../../../models/input/user.image.input.model';
import { FileServiceAdapter } from '../../../../../base/application/adapters/file-service.adapter';
import { UsersQueryRepository } from '../../../infrastructure/users.query.repo';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import {
  fileField,
  invalidUserPhoto,
  userIdField,
  userNotFound,
} from '../../../../../base/constants/constants';
import { UsersRepository } from '../../../infrastructure/users.repo';

export class UploadUserPhotoCommand {
  constructor(public data: UserImageInputModel) {}
}

@CommandHandler(UploadUserPhotoCommand)
export class UploadUserPhotoUseCase
  implements ICommandHandler<UploadUserPhotoCommand>
{
  logger = new Logger(UploadUserPhotoUseCase.name);

  constructor(
    private readonly fileServiceAdapter: FileServiceAdapter,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute({ data }: UploadUserPhotoCommand) {
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

    const resultValidate = this.validateImage(metadata);

    if (!resultValidate.data) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: fileField,
        message: invalidUserPhoto,
      };
    }

    const payload = this.getPayload(data, metadata);
    const uploadResult = await this.fileServiceAdapter.upload(payload);

    if (!uploadResult.data) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: fileField,
        message: 'Upload error',
      };
    }

    const updateAvatarId = await this.usersRepository.updateAvatarId(
      data.userId,
      uploadResult.res.toString(),
    );

    if (!updateAvatarId) {
      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: fileField,
        message: 'Update error',
      };
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }

  private validateImage(metadata: sharp.Metadata) {
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

  private getPayload(
    data: UserImageInputModel,
    metadata: sharp.Metadata,
  ): UploadFileRequest {
    return {
      userId: data.userId,
      originalName: data.originalName,
      buffer: data.buffer,
      format: metadata.format,
      fileType: FileType.Avatar,
      ownerId: data.userId,
    };
  }
}
