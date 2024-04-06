import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersQueryRepository } from '../../../user/infrastructure/users.query.repo';

@Injectable()
export class AuthService {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

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
}
