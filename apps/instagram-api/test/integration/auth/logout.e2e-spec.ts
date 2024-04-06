import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { beforeAllConfig } from '../../base/settings/before-all-config';
import {
  expiredRefreshToken,
  invalidRefreshToken,
} from "../../base/constants/tests-strings";
import { TestManager } from '../../base/managers/test.manager';

const logout_url = '/api/v1/auth/logout';

describe('AuthController: /logout', () => {
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

  describe('negative', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should return the 401 status if there is no token in the cookies`, async () => {
      const response = await agent
        .post(logout_url)
        .expect(401);
    });
    it(`should return the 401 status if there is invalid token in the cookies`, async () => {
      const response = await agent
        .post(logout_url)
        .set('Cookie', `refreshToken=${invalidRefreshToken}`)
        .expect(401);
    });
    it(`should return the 401 status if there is expired token in the cookies`, async () => {
      const response = await agent
        .post(logout_url)
        .set('Cookie', `refreshToken=${expiredRefreshToken}`)
        .expect(401);
    });

  });
});
