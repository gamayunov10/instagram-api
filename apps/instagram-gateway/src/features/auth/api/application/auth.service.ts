import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

import { UsersQueryRepository } from '../../../users/infrastructure/users.query.repo';
import { UsersRepository } from '../../../users/infrastructure/users.repo';
import { UserOauthCredInputModel } from '../../models/input/user-oauth-cred.input.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  async hashPassword(
    password: string,
    rounds = 10,
    salt = this.configService.get('CRYPTO_SALT'),
  ) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, rounds, 64, 'sha256', (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          resolve(derivedKey.toString('hex'));
        }
      });
    });
  }

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
      this.configService.get('CRYPTO_SALT'),
      user.passwordHash,
    );

    return isHashesEquals ? user.id : false;
  }

  async _isPasswordCorrect(password, salt, storedHash): Promise<boolean> {
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 10, 64, 'sha256')
      .toString('hex');

    return hashedPassword === storedHash;
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
  createBasicAuthString(email: string, password: string): string {
    const validEmail = this.configService.get<string>('BASIC_AUTH_USERNAME');
    const validPassword = this.configService.get<string>('BASIC_AUTH_PASSWORD');

    if (email !== validEmail || password !== validPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const authString = `${email}:${password}`;
    const base64AuthString = Buffer.from(authString).toString('base64');
    return `Basic ${base64AuthString}`;
  }

  validateAuthorization(authHeader: string): boolean {
    const [, credentials] = authHeader.split(' ');

    const decodedCredentials = Buffer.from(credentials, 'base64').toString(
      'utf8',
    );
    const [username, password] = decodedCredentials.split(':');

    const validUsername = this.configService.get<string>('BASIC_AUTH_USERNAME');
    const validPassword = this.configService.get<string>('BASIC_AUTH_PASSWORD');

    if (username !== validUsername || password !== validPassword) {
      return false;
    }

    return true;
  }
}
