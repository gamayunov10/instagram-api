import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { createUserInput } from '../../base/constants/tests-strings';
import { UserCredentialsType } from '../../base/types/testing.type';

import { notifications_url } from './get-notifications.spec';
import { notificationsMarkAsRead_url } from './mark-notifications-as-read.spec';

export const notificationsUnreadCount_url =
  '/api/v1/notifications/unread-count';

describe('NotificationsController: /notifications/unread-count', (): void => {
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

    it(`should not get unread count if bearer token is incorrect`, async (): Promise<void> => {
      await agent
        .get(notificationsUnreadCount_url)
        .auth('incorrect-accessToken', { type: 'bearer' }) // accessToken incorrect
        .expect(401);
    });
  });

  describe('positive', () => {
    let user: UserCredentialsType;
    let notificationId: string;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user and notification`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);

      await testManager.createTestNotification(user.id); // Create a test notification

      const response = await agent
        .get(notifications_url)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(200);

      notificationId = response.body.items[0].id;
    });

    it(`should mark notification as read`, async (): Promise<void> => {
      await agent
        .put(notificationsMarkAsRead_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ ids: [notificationId] })
        .expect(204);
    });

    it(`should get unread count correctly`, async (): Promise<void> => {
      const response = await agent
        .get(notificationsUnreadCount_url)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(200);

      expect(response.body.count).toEqual(0); // Expecting 0 because the notification was marked as read
    });

    it(`should return correct unread count when there are unread notifications`, async (): Promise<void> => {
      // Create an unread notification
      await testManager.createTestNotification(user.id);

      const response = await agent
        .get(notificationsUnreadCount_url)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(200);

      expect(response.body.count).toEqual(1); // Expecting 1 because we just created an unread notification
    });
  });
});
