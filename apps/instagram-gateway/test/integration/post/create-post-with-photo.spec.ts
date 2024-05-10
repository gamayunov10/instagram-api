import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import * as path from 'path';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { createUserInput } from '../../base/constants/tests-strings';
import { UserCredentialsType } from '../../base/types/testing.type';

export const post_photo_url = '/api/v1/post/photo/';
export const post_with_photo_url = '/api/v1/post/';

describe('PostController: /post/photo; /post;', (): void => {
  let app: INestApplication;
  let agent: TestAgent<any>;
  let testManager: TestManager;

  beforeAll(async (): Promise<void> => {
    const config = await beforeAllConfig();
    app = config.app;
    agent = config.agent;
    testManager = config.testManager;
  });

  afterAll(async () => {
    await app.close();
    await prismaClientSingleton.getPrisma().$disconnect();
  });

  describe('negative', (): void => {
    it(`should clear database`, async (): Promise<void> => {
      await agent.delete('/api/v1/testing/all-data');
    });

    let user: UserCredentialsType;

    it(`should clear database`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
    });

    it(`should not Upload post photo if bearer token is missing`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      await agent
        .post(post_photo_url)
        // .auth(user.accessToken, { type: 'bearer' }) // missing
        .attach('file', imagePath)
        .expect(401);
    });

    it(`should not Upload post photo if token has incorrect type`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      await agent
        .post(post_photo_url)
        .auth(user.accessToken + imagePath, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(401);
    });
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });
  });
});
