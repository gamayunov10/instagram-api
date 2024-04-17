import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { TestManager } from '../../base/managers/test.manager';
import {
  userEmail2,
  username2,
  userPassword,
} from '../../base/constants/tests-strings';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';

import { registration_url } from './registration.e2e-spec';

export const me_url = '/api/v1/auth/me';

describe('AuthController: /me', () => {
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
    await prismaClientSingleton.getPrisma().$disconnect();
  });

  describe('negative', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should not Get information about current user if accessToken is missing`, async () => {
      await agent.get(me_url).expect(401);
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

      const accessToken = response.body.accessToken;

      await agent
        .get(me_url)
        .auth(accessToken, { type: 'bearer' })
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toEqual(userEmail2);
          expect(res.body.username).toEqual(username2);
          expect(res.body.userId).toEqual(expect.anything());
        });
    });
  });
});
