import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import path from 'path';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { UserCredentialsType } from '../../base/types/testing.type';
import { createUserInput } from '../../base/constants/tests-strings';

import { upload_user_photo_url } from './upload-user-photo.spec';

export const delete_user_photo_url = '/api/v1/user/delete-user-photo';

describe('UserController: /delete-user-photo', () => {
  let app: INestApplication;
  let agent: TestAgent<any>;
  let testManager: TestManager;

  beforeAll(async () => {
    const config = await beforeAllConfig();
    app = config.app;
    agent = config.agent;
    testManager = config.testManager;
  });

  afterAll(async () => {
    await app.close();
    await prismaClientSingleton.getPrisma().$disconnect();
  });

  describe('negative', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    let user: UserCredentialsType;

    it(`should create user`, async () => {
      user = await testManager.createUser(createUserInput);
    });

    it(`should not Delete user photo if bearer token is missing`, async (): Promise<void> => {
      await agent
        .delete(delete_user_photo_url)
        // .auth(user.accessToken, { type: 'bearer' }) // missing
        .expect(401);
    });

    it(`should not Delete user photo if bearer token is incorrect`, async (): Promise<void> => {
      await agent
        .delete(delete_user_photo_url)
        .auth('user.accessToken', { type: 'bearer' }) // incorrect
        .expect(401);
    });

    it(`should not Delete user photo if bearer token is incorrect`, async (): Promise<void> => {
      await agent
        .delete(delete_user_photo_url)
        .auth(user.accessToken + 1, { type: 'bearer' }) // incorrect
        .expect(401);
    });
  });

  describe('positive', () => {
    let user: UserCredentialsType;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user`, async () => {
      user = await testManager.createUser(createUserInput);
    });

    it(`should Upload user photo`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      await agent
        .post(upload_user_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(204);
    });

    it(`should Delete user photo`, async (): Promise<void> => {
      await agent
        .delete(delete_user_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(204);
    });
  });
});
