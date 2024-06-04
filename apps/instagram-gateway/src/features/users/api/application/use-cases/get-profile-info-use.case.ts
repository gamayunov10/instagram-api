import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersQueryRepository } from '../../../infrastructure/users.query.repo';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import {
  userIdField,
  userNotFound,
} from '../../../../../base/constants/constants';
import { UserProfileOutputModel } from '../../../models/output/user.profile.output.model';
import { FileServiceAdapter } from '../../../../../base/application/adapters/file-service.adapter';

export class GetProfileInfoCommand {
  constructor(public userId: string) {}
}

@CommandHandler(GetProfileInfoCommand)
export class GetProfileInfoUseCase
  implements ICommandHandler<GetProfileInfoCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly fileServiceAdapter: FileServiceAdapter,
  ) {}

  async execute(command: GetProfileInfoCommand) {
    const user = await this.usersQueryRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.Unauthorized,
        field: userIdField,
        message: userNotFound,
      };
    }

    let avatarUrl = null;

    if (user.avatarId) {
      const avatar = await this.fileServiceAdapter.getFileUrlByFileId(
        user.avatarId,
      );
      avatarUrl = { url: avatar };
    }

    const result: UserProfileOutputModel = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.birthDate,
      city: user.city,
      aboutMe: user.aboutMe,
      avatar: avatarUrl,
    };

    return result;
  }
}
