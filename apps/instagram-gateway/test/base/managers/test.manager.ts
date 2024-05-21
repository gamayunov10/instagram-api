import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';

import { UsersQueryRepository } from '../../../src/features/user/infrastructure/users.query.repo';
import { registration_url } from '../../integration/auth/registration.spec';
import { registration_confirmation_url } from '../../integration/auth/registration-confirmation.spec';
import { login_url } from '../../integration/auth/login.spec';
import { UserCredentialsType, UserInputModelType } from '../types/testing.type';
import { PostsRepository } from '../../../src/features/post/infrastructure/posts.repo';

export class TestManager {
  constructor(
    protected readonly app: INestApplication,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly postsRepository: PostsRepository,
  ) {}

  async getEmailConfirmationCode(email: string): Promise<string> {
    const result = await this.usersQueryRepository.getUserWithRelations(email);

    return result?.confirmationCode?.confirmationCode;
  }

  async getDeviceIdByEmail(email: string) {
    const result = await this.usersQueryRepository.getUserWithRelations(email);

    return result?.device[0].deviceId;
  }

  async createUser(
    createModel: UserInputModelType,
  ): Promise<UserCredentialsType> {
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

    return result?.passwordRecoveryCode?.recoveryCode;
  }

  async getUserProfile(email: string) {
    return await this.usersQueryRepository.getUserWithRelations(email);
  }

  async updateDeletedAtForTests(postId: string): Promise<boolean> {
    return await this.postsRepository.updateDeletedAtForTests(postId);
  }
}
