import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { TestManager } from '../managers/test.manager';
import { UsersQueryRepository } from '../../../src/features/users/infrastructure/users.query.repo';
import { PostsRepository } from '../../../src/features/posts/infrastructure/posts.repo';
import { NotificationsRepository } from '../../../src/features/notifications/infrastructure/notifications.repo';

import { initializeApp } from './initialize-app';

export async function beforeAllConfig(): Promise<{
  app: INestApplication;
  agent: TestAgent<any>;
  testManager: TestManager;
}> {
  const result = await initializeApp();
  const app = result.app;
  const agent = result.agent;

  const usersQueryRepository = app.get(UsersQueryRepository);

  const postsRepository = app.get(PostsRepository);

  const notificationsRepository = app.get(NotificationsRepository);

  const testManager = new TestManager(
    app,
    usersQueryRepository,
    postsRepository,
    notificationsRepository,
  );

  return { app, agent, testManager };
}
