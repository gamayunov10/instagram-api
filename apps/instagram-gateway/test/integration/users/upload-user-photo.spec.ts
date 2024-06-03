import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import path from 'path';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { UserCredentialsType } from '../../base/types/testing.type';
import { createUserInput } from '../../base/constants/tests-strings';

export const upload_user_photo_url = '/api/v1/user/upload-user-photo';

describe('UsersController: /upload-user-photo', () => {
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
    await prismaClientSingleton.disconnect();
  });

  describe('negative', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    let user: UserCredentialsType;

    it(`should create user`, async () => {
      user = await testManager.createUser(createUserInput);
    });

    it(`should not Upload user photo if bearer token is missing`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      await agent
        .post(upload_user_photo_url)
        // .auth(user.accessToken, { type: 'bearer' }) // missing
        .attach('file', imagePath)
        .expect(401);
    });

    it(`should not Upload user photo if token has incorrect type`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      await agent
        .post(upload_user_photo_url)
        .auth(user.accessToken + imagePath, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(401);
    });

    it(`should not Upload user photo if file is missing`, async (): Promise<void> => {
      // const imagePath = path.join(__dirname, '../../base/assets/node.png');

      await agent
        .post(upload_user_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        // .attach('file', imagePath) // missing
        .expect(400);
    });

    it(`should not Upload user photo if field file is missing`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      await agent
        .post(upload_user_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('photo', imagePath) // missing
        .expect(400);
    });

    it(`should not Upload user photo if file has incorrect type`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/rocket.svg');

      await agent
        .post(upload_user_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(400);
    });

    it(`should not Upload user photo if file is undefined`, async (): Promise<void> => {
      const imagePath = undefined;

      await agent
        .post(upload_user_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(400);
    });

    it(`should not Upload user photo if file is an empty string`, async (): Promise<void> => {
      await agent
        .post(upload_user_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', '')
        .expect(400);
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
  });
});
