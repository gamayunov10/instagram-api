import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { createUserInput } from '../../base/constants/tests-strings';
import { UserCredentialsType } from '../../base/types/testing.type';

import { notifications_url } from './get-notifications.spec';

export const notificationsMarkAsRead_url = '/api/v1/notifications/mark-as-read';

describe('NotificationsController: /notifications/', (): void => {
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

    it(`should not update notifications if bearer token is incorrect`, async (): Promise<void> => {
      await agent
        .put(notificationsMarkAsRead_url)
        .auth('incorrect-accessToken', { type: 'bearer' }) // accessToken incorrect
        .expect(401);
    });

    it(`should not update notifications if inputModel is incorrect`, async (): Promise<void> => {
      await agent
        .put(notificationsMarkAsRead_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ ids: '' })
        .expect(400);
    });
  });

  describe('positive', () => {
    let user: UserCredentialsType;
    let notificationId;
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user and notification`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);

      await testManager.createTestNotification(user.id);

      const response = await agent
        .get(notifications_url)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(200);

      notificationId = response.body.items[0].id;
    });

    it(`should update notification `, async (): Promise<void> => {
      await agent
        .put(notificationsMarkAsRead_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ ids: [notificationId] })
        .expect(204);

      const notification = await agent
        .get(notifications_url)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(200);

      expect(notification.body.items[0].isRead).toEqual(true);
    });
  });
});
