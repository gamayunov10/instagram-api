import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from 'nestjs-dataloader';

import { UsersService } from '../../features/users/api/application/users.service';
import { UserModel } from '../../resolvers/users/models/user.model';

@Injectable()
export class UserLoader implements NestDataLoader<string, UserModel | null> {
  constructor(private readonly usersService: UsersService) {}

  generateDataLoader(): DataLoader<string, UserModel | null> {
    const batchLoadFn: DataLoader.BatchLoadFn<
      string,
      UserModel | null
    > = async (userIds: string[]) => {
      const users = await this.usersService.findUsersByIds(userIds);
      const usersMap = new Map<string, UserModel>();

      users.forEach((user) => usersMap.set(user.id, user));

      return userIds.map((userId) => usersMap.get(userId) || null);
    };

    return new DataLoader(batchLoadFn);
  }
}
