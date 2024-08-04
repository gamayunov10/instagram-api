import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { createUserInput } from '../../base/constants/tests-strings';
import { UserCredentialsType } from '../../base/types/testing.type';

export const get_current_subscription_url =
  '/api/v1/subscriptions/current-subscription/';

describe('Subscriptions: /current-subscription;', (): void => {
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

    it(`should not current subscription if bearer token is missing`, async (): Promise<void> => {
      await agent
        .get(get_current_subscription_url)
        // .auth(user.accessToken, { type: 'bearer' }) // missing
        .expect(401);
    });

    it(`should not current subscription if token has incorrect type`, async (): Promise<void> => {
      await agent
        .get(get_current_subscription_url)
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

    it(`should current subscription`, async (): Promise<void> => {
      const result = await agent
        .get(get_current_subscription_url)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(200);
      expect(result.body).toEqual({
        userId: user.id,
        expireAt: null,
        nextPayment: null,
        customerId: null,
        subscriptionId: null,
        autoRenewal: false,
      });
    });
  });
});
