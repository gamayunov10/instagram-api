import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { createUserInput } from '../../base/constants/tests-strings';
import { UserCredentialsType } from '../../base/types/testing.type';

export const notifications_url = '/api/v1/notifications';

describe('NotificationsController: /notifications', (): void => {
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

  describe('negative', () => {
    let user: UserCredentialsType;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
    });

    it(`should not notifications if bearer token is incorrect`, async (): Promise<void> => {
      await agent
        .get(notifications_url)
        .auth('incorrect-accessToken', { type: 'bearer' }) // accessToken incorrect
        .expect(401);
    });

    it(`should not return notifications if query is incorrect`, async (): Promise<void> => {
      await agent
        .get(notifications_url)
        .auth(user.accessToken, { type: 'bearer' })
        .query({ sortDirection: 'ASC' }) // should be in lowercase
        .expect(400);
    });

    it(`should not return notifications if query is incorrect`, async (): Promise<void> => {
      await agent
        .get(notifications_url)
        .auth(user.accessToken, { type: 'bearer' })
        .query({ sortDirection: 'Asc' }) // should be in lowercase
        .expect(400);
    });

    it(`should not return notifications if query is incorrect`, async (): Promise<void> => {
      await agent
        .get(notifications_url)
        .auth(user.accessToken, { type: 'bearer' })
        .query({ sortDirection: 'DESC' }) // should be in lowercase
        .expect(400);
    });

    it(`should not return notifications if query is incorrect`, async (): Promise<void> => {
      await agent
        .get(notifications_url)
        .auth(user.accessToken, { type: 'bearer' })
        .query({ sortDirection: 'Desc' }) // should be in lowercase
        .expect(400);
    });

    it(`should not return notifications if query is incorrect`, async (): Promise<void> => {
      await agent
        .get(notifications_url)
        .auth(user.accessToken, { type: 'bearer' })
        .query({ sortField: 'createdat' }) // should contain PostSortFields enum values
        .expect(400);
    });

    it(`should not return notifications if query is incorrect`, async (): Promise<void> => {
      await agent
        .get(notifications_url)
        .auth(user.accessToken, { type: 'bearer' })
        .query({ page: '1s' }) // should not be NaN
        .expect(400);
    });
  });

  describe('positive', () => {
    let user: UserCredentialsType;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user and notification`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
      await testManager.createTestNotification(user.id);
    });

    it(`should return notifications`, async (): Promise<void> => {
      const response = await agent
        .get(notifications_url)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(200);

      expect(response.body).toEqual({
        page: 1,
        pagesCount: 1,
        pageSize: 8,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            message: expect.any(String),
            isRead: false,
            createdAt: expect.any(String),
            userId: user.id,
          },
        ],
      });
    });
  });
});
