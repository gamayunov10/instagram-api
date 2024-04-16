import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserProfileInputModel } from '../../../models/input/user.profile.input.model';
import { UsersRepository } from '../../../infrastructure/users.repo';
import { UsersQueryRepository } from '../../../infrastructure/users.query.repo';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import {
  userIdField,
  usernameField,
  usernameNotUnique,
  userNotFound,
} from '../../../../../base/constants/constants';

export class FillOutProfileCommand {
  constructor(
    public userId: string,
    public userProfileInputModel: UserProfileInputModel,
  ) {}
}

@CommandHandler(FillOutProfileCommand)
export class FillOutProfileUseCase
  implements ICommandHandler<FillOutProfileCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: FillOutProfileCommand) {
    const user = await this.usersQueryRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: userIdField,
        message: userNotFound,
      };
    }

    const uniqueUsername = await this.usersQueryRepository.findUserByUsername(
      command.userProfileInputModel.username,
    );

    if (uniqueUsername?.username) {
      if (user.id !== uniqueUsername.id) {
        return {
          data: false,
          code: ResultCode.BadRequest,
          field: usernameField,
          message: usernameNotUnique,
        };
      }
    }

    // upload image

    const result = await this.usersRepository.fillOutProfile(
      command.userId,
      command.userProfileInputModel,
    );

    if (result) {
      return {
        data: true,
        code: ResultCode.Success,
      };
    } else {
      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: 'None',
        message: 'Error! Server is not available',
      };
    }
  }
}
