import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { beforeAllConfig } from './base/settings/before-all-config';
import { TestManager } from './base/managers/test.manager';

describe('AppController (e2e)', () => {
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
  });

  it('/ (GET)', () => {
    return agent.get('/').expect(200).expect('Hello World!');
  });
});
