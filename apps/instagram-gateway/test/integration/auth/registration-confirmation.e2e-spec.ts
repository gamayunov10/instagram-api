import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { TestManager } from '../../base/managers/test.manager';
import {
  userEmail1,
  username1,
  userPassword,
} from '../../base/constants/tests-strings';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';

import { registration_url } from './registration.e2e-spec';

export const registration_confirmation_url =
  '/api/v1/auth/registration-confirmation';

describe('AuthController: /registration-confirmation', () => {
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

    it(`should return 400 f the confirmation code is incorrect`, async () => {
      await agent
        .post(registration_confirmation_url)
        .send({
          code: 'invalidConfirmationCode',
        })
        .expect(400);
    });

    it(`should return 400 if the confirmation code already been applied`, async () => {
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

      await agent
        .post(registration_confirmation_url)
        .send({
          code: confirmationCode,
        })
        .expect(400);
    });
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should confirm registration by confirmationCode`, async () => {
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
    });
  });
});
