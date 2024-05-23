import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import {
  invalidRefreshToken,
  userEmail1,
  username1,
  userPassword,
} from '../../base/constants/tests-strings';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { TestManager } from '../../base/managers/test.manager';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';

import { registration_url } from './registration.spec';
import { registration_confirmation_url } from './registration-confirmation.spec';
import { login_url } from './login.spec';

export const logout_url = '/api/v1/auth/logout';

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
    await prismaClientSingleton.disconnect();
  });

  describe('negative', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should return the 401 status if there is no token in the cookies`, async () => {
      await agent.post(logout_url).expect(401);
    });

    it(`should return the 401 status if there is invalid token in the cookies`, async () => {
      await agent
        .post(logout_url)
        .set('Cookie', `refreshToken=${invalidRefreshToken}`)
        .expect(401);
    });
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`the value 204 should be returned after the user has successfully logged in and logged out`, async () => {
      await agent
        .post(registration_url)
        .send({
          username: username1,
          password: userPassword,
          email: userEmail1,
        })
        .expect(204);
      const confirmationCode =
        await testManager.getEmailConfirmationCode(userEmail1);

      await agent
        .post(registration_confirmation_url)
        .send({
          code: confirmationCode,
        })
        .expect(204);

      const res = await agent
        .post(login_url)
        .send({
          password: userPassword,
          email: userEmail1,
        })
        .expect(200);
      expect(res.body).toEqual({ accessToken: expect.any(String) });

      const refreshTokenUser01 = res.headers['set-cookie'][0];
      await agent
        .post(logout_url)
        .set('Cookie', refreshTokenUser01)
        .expect(204);
    });
  });
});
