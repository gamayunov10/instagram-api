import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { TestManager } from '../managers/test.manager';
import { initializeApp } from './initialize-app';

export async function beforeAllConfig(): Promise<{
  app: INestApplication;
  agent: TestAgent<any>;
  testManager: TestManager;
}> {
  const result = await initializeApp();
  const app = result.app;
  const agent = result.agent;

  const testManager = new TestManager(app);

  return { app, agent, testManager };
}
