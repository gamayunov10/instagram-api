import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { createUserInput } from '../../base/constants/tests-strings';
import { UserCredentialsType } from '../../base/types/testing.type';

export const get_my_payment_url = '/api/v1/subscriptions/my-payments/';

describe('Subscriptions: /my-payments;', (): void => {
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
    await prismaClientSingleton.disconnect();
  });

  describe('negative', (): void => {
    it(`should clear database`, async (): Promise<void> => {
      await agent.delete('/api/v1/testing/all-data');
    });

    let user: UserCredentialsType;

    it(`should create user`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
    });

    it(`should not my payments if bearer token is missing`, async (): Promise<void> => {
      await agent
        .get(get_my_payment_url)
        // .auth(user.accessToken, { type: 'bearer' }) // missing
        .expect(401);
    });

    it(`should not my payments if token has incorrect type`, async (): Promise<void> => {
      await agent
        .get(get_my_payment_url)
        .auth(user.accessToken + '21121', { type: 'bearer' })
        .expect(401);
    });
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    let user: UserCredentialsType;

    it(`should create user`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
    });

    it(`should my payments`, async (): Promise<void> => {
      const result = await agent
        .get(get_my_payment_url)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(200);

      expect(result.body).toEqual({
        page: 1,
        pageSize: 8,
        pagesCount: 0,
        totalCount: 0,
        items: [],
      });
    });
  });
});
