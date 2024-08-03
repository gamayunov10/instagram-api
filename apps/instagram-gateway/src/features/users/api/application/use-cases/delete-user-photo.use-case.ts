import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { UsersRepository } from '../../../infrastructure/users.repo';
import { FileServiceAdapter } from '../../../../../base/application/adapters/file-service.adapter';
import { UsersQueryRepository } from '../../../infrastructure/users.query.repo';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import {
  fileField,
  userIdField,
  userNotFound,
} from '../../../../../base/constants/constants';

export class DeleteUserPhotoCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserPhotoCommand)
export class DeleteUserPhotoUseCase
  implements ICommandHandler<DeleteUserPhotoCommand>
{
  logger = new Logger(DeleteUserPhotoUseCase.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly fileServiceAdapter: FileServiceAdapter,
  ) {}

  async execute({ userId }: DeleteUserPhotoCommand) {
    const user = await this.usersQueryRepository.findUserById(userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.Unauthorized,
        field: userIdField,
        message: userNotFound,
      };
    }

    const result = await this.fileServiceAdapter.deleteFile(user?.avatarId);

    if (!result.data) {
      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: fileField,
        message: 'Delete error',
      };
    }

    const updateAvatarId = await this.usersRepository.updateAvatarId(
      user.id,
      null,
      null,
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
}
