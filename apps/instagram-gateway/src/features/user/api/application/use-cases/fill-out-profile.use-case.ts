import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserProfileInputModel } from '../../../models/input/user.profile.input.model';
import { UsersRepository } from '../../../infrastructure/users.repo';
import { UsersQueryRepository } from '../../../infrastructure/users.query.repo';

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

  }
}
