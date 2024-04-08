import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersQueryRepository } from '../../../user/infrastructure/users.query.repo';
import { UsersRepository } from '../../../user/infrastructure/users.repo';
import { UserOauthCredInputModel } from '../../models/input/user-oauth-cred.input.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async checkCredentials(email: string, password: string) {
    const user = await this.usersQueryRepository.findUserByEmail(email);

    if (!user) {
      return false;
    }

    if (!user.isConfirmed) {
      return false;
    }

    const isHashesEquals: boolean = await this._isPasswordCorrect(
      password,
      user.passwordHash,
    );

    return isHashesEquals ? user.id.toString() : false;
  }

  async _isPasswordCorrect(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async validateUser(data: UserOauthCredInputModel) {
    const user = await this.usersQueryRepository.findUserByEmail(data.email);

    if (user) {
      const existingProvider =
        await this.usersQueryRepository.findUserProviderInfo(user.id);

      if (
        existingProvider[0]?.provider === data.provider ||
        existingProvider[1]?.provider === data.provider
      ) {
        let id = existingProvider[0]?.id;

        if (existingProvider[1]?.provider === data.provider) {
          id = existingProvider[1]?.id;
        }

        await this.usersRepository.updateUserProviderInfo(data, id, user.id);
      } else {
        await this.usersRepository.mergeUserProviderInfo(data, user.id);
      }

      return user;
    }

    const newUser = await this.usersRepository.createUserByOAuth(data);

    return newUser || null;
  }

  async findUserById(id: string) {
    return await this.usersQueryRepository.findUserById(id);
  }
}
