import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import { randomUUID } from 'crypto';

import { TestManager } from '../../base/managers/test.manager';
import {
  userEmail1,
  username1,
  userPassword,
} from '../../base/constants/tests-strings';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';

import { passwd_recovery_url } from './passwd-recovery.spec';
import { registration_url } from './registration.spec';

export const new_password_url = '/api/v1/auth/new-password';

describe('AuthController: /new-password', () => {
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

    it(`should return 400 If the inputModel has incorrect value`, async () => {
      await agent
        .post(new_password_url)
        .send({
          newPassword: 'new271543523',
          recoveryCode: '',
        })
        .expect(400);
    });

    it(`should return 400 If the inputModel has incorrect value`, async () => {
      await agent
        .post(new_password_url)
        .send({
          newPassword: 'new271543523',
          recoveryCode: randomUUID(),
        })
        .expect(400);
    });
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should Confirm Password recovery`, async () => {
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
        .post('/api/v1/auth/registration-confirmation/')
        .send({
          code: confirmationCode,
        })
        .expect(204);

      await agent
        .post(passwd_recovery_url)
        .send({
          email: userEmail1,
          reCaptcha: 'sfadsfg',
        })
        .expect(204);

      const recoveryCode = await testManager.getRecoveryCode(userEmail1);

      await agent
        .post(new_password_url)
        .send({
          newPassword: 'new271543523',
          recoveryCode: recoveryCode,
        })
        .expect(204);
    }, 10000);
  });
});
