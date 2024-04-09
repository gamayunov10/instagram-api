import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import {
  userEmail2,
  username2,
  userPassword,
} from '../../base/constants/tests-strings';
import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';

import { registration_url } from './registration.e2e-spec';

export const refresh_token_url = '/api/v1/auth/refresh-token';

describe('AuthController: /refresh-token', () => {
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
    it(`should return 401 if refreshToken is missing`, async () => {
      await agent.post(refresh_token_url).expect(401);
    });
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });
    it(`should Get information about current user`, async () => {
      await agent
        .post(registration_url)
        .send({
          username: username2,
          password: userPassword,
          email: userEmail2,
        })
        .expect(204);

      const confirmationCode =
        await testManager.getEmailConfirmationCode(userEmail2);

      await agent
        .post('/api/v1/auth/registration-confirmation/')
        .send({
          code: confirmationCode,
        })
        .expect(204);

      const response = await agent
        .post('/api/v1/auth/login/')
        .send({
          password: userPassword,
          email: userEmail2,
        })
        .expect(200);

      const setCookieHeader = response.headers['set-cookie'][0];
      const match = setCookieHeader.match(/refreshToken=(.*?);/);
      const refreshToken = match ? match[1] : null;

      await agent
        .post(refresh_token_url)
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toEqual(expect.any(String));
          const refreshTokenCookie = res
            .get('Set-Cookie')
            .find((cookie) => cookie.startsWith('refreshToken'));

          expect(refreshTokenCookie).toBeDefined();
        });
    });
  });
});
