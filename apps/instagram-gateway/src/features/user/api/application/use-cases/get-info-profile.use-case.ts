import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersQueryRepository } from '../../../infrastructure/users.query.repo';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import {
  userIdField,
  userNotFound,
} from '../../../../../base/constants/constants';
import { UserProfileOutputModel } from '../../../models/output/user.profile.output.model';

export class GetInfoProfileCommand {
  constructor(public userId: string) {}
}

@CommandHandler(GetInfoProfileCommand)
export class GetInfoProfileUseCase
  implements ICommandHandler<GetInfoProfileCommand>
{
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async execute(command: GetInfoProfileCommand) {
    const user = await this.usersQueryRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.Unauthorized,
        field: userIdField,
        message: userNotFound,
      };
    }
    const result: UserProfileOutputModel = {
      userName: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.birthDate,
      city: user.city,
      aboutMe: user.aboutMe,
    };
    return result;
  }
}
