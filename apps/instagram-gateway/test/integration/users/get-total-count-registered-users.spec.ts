import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { UserCredentialsType } from '../../base/types/testing.type';
import {
  createUserInput,
  createUserInput2,
  createUserInput3,
} from '../../base/constants/tests-strings';

export const get_count_registered_users = '/api/v1/public-user';

describe('UsersController: /public-user', () => {
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

  describe('positive', () => {
    let user: UserCredentialsType;
    let user2: UserCredentialsType;
    let user3: UserCredentialsType;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should return 200, there are no registered users`, async () => {
      const res = await agent.get(get_count_registered_users).expect(200);
      expect(res.body).toEqual({ totalCount: 0 });
    });

    it(`should create 3 users`, async () => {
      user = await testManager.createUser(createUserInput);
      user2 = await testManager.createUser(createUserInput2);
      user3 = await testManager.createUser(createUserInput3);
    });

    it(`should return 200 and the number of registered users`, async () => {
      const res = await agent.get(get_count_registered_users).expect(200);
      expect(res.body).toEqual({ totalCount: 3 });
    });
  });
});
