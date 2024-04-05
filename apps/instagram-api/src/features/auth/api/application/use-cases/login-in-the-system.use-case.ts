import { User } from './../../../../user/entities/user.entity';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserConfirmationCodeInputModel } from '../../../models/input/user-confirmation-code.input.model';
import { UsersRepository } from '../../../../user/infrastructure/users.repo';
import { UsersQueryRepository } from '../../../../user/infrastructure/users.query.repo';
import { UserLoginInputModel } from '../../../models/input/user-login.input.model';

export class LoginInTheSystemCommand {
  constructor(
    public userLoginInputModel: UserLoginInputModel,
  ) {}
}

@CommandHandler(LoginInTheSystemCommand)
export class LoginInTheSystemUseCase
  implements ICommandHandler<LoginInTheSystemCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: LoginInTheSystemCommand): Promise<User | null> {
    const user =
      await this.usersQueryRepository.findUserByEmail(
        command.userLoginInputModel.email,
      )

    return user;
  }
}
