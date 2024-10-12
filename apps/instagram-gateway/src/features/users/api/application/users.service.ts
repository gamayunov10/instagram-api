import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UsersRepository } from '../../infrastructure/users.repo';
import { UsersQueryRepository } from '../../infrastructure/users.query.repo';
import { UserModel } from '../../../../resolvers/users/models/user.model';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,

    private readonly configService: ConfigService,
  ) {}
  async getAllUsers(): Promise<UserModel[]> {
    const result = await this.usersQueryRepository.getUsersWithRelations();
    const users: UserModel[] = result.map((user) => {
      return {
        id: user.id,
        username: user.username,
        accountType: user.accountType,
        endDateOfSubscription: user.endDateOfSubscription,
        autoRenewal: user.autoRenewal,
        email: user.email,
        createdAt: user.createdAt,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        city: user.city,
        country: user.country,
        aboutMe: user.aboutMe,
        avatarURL: user.avatarURL,
      };
    });
    return users;
  }
}
