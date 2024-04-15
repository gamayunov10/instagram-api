import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';

import { UsersQueryRepository } from '../../../src/features/user/infrastructure/users.query.repo';
import { registration_url } from '../../integration/auth/registration.e2e-spec';
import { registration_confirmation_url } from '../../integration/auth/registration-confirmation.e2e-spec';
import { login_url } from '../../integration/auth/login.e2e-spec';

export class TestManager {
  constructor(
    protected readonly app: INestApplication,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async getEmailConfirmationCode(email: string): Promise<string> {
    const result = await this.usersQueryRepository.getUserWithRelations(email);

    return result?.confirmationCode?.confirmationCode;
  }

  async getDeviceIdByEmail(email: string) {
    const result = await this.usersQueryRepository.getUserWithRelations(email);

    return result?.device[0].deviceId;
  }

  async createUser(createModel: any) {
    await supertest(this.app.getHttpServer())
      .post(registration_url)
      .send(createModel)
      .expect(204);

    const confirmationCode = await this.getEmailConfirmationCode(
      createModel.email,
    );

    await supertest(this.app.getHttpServer())
      .post(registration_confirmation_url)
      .send({ code: confirmationCode })
      .expect(204);

    const login = await supertest(this.app.getHttpServer())
      .post(login_url)
      .send({
        password: createModel.password,
        email: createModel.email,
      })
      .expect(200);

    const accessToken = login.body.accessToken;
    const refreshToken = login.headers['set-cookie'][0];
    const createdUser = await this.usersQueryRepository.getUserWithRelations(
      createModel.email,
    );

    return {
      id: createdUser.id,
      accessToken,
      refreshToken,
    };
  }

  async getRecoveryCode(email: string): Promise<string> {
    const result = await this.usersQueryRepository.getUserWithRelations(email);

    return result?.PasswordRecoveryCode?.recoveryCode;
  }
}
