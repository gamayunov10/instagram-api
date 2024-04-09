import { INestApplication } from '@nestjs/common';

import { UsersQueryRepository } from '../../../src/features/user/infrastructure/users.query.repo';

export class TestManager {
  constructor(
    protected readonly app: INestApplication,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async getEmailConfirmationCode(email: string): Promise<string> {
    const result = await this.usersQueryRepository.getUserWithRelations(email);

    return result?.confirmationCode?.confirmationCode;
  }

  async getRecoveryCode(email: string): Promise<string> {
    const result = await this.usersQueryRepository.getUserWithRelations(email);

    return result?.PasswordRecoveryCode?.recoveryCode;
  }
}
