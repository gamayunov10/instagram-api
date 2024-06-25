import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UsersQueryRepository } from '../../../infrastructure/users.query.repo';
import { CountRegisteredUsers } from '../../../models/output/count.registered.users.model';

export class GetTotalCountRegisteredUsersCommand {
  constructor() {}
}

@CommandHandler(GetTotalCountRegisteredUsersCommand)
export class GetTotalCountRegisteredUsersUseCase
  implements ICommandHandler<GetTotalCountRegisteredUsersCommand>
{
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async execute(): Promise<CountRegisteredUsers> {
    const users = await this.usersQueryRepository.getTotalCountUsers();

    if (!users) {
      return {
        totalCount: 0,
      };
    }
    return {
      totalCount: users.length,
    };
  }
}
