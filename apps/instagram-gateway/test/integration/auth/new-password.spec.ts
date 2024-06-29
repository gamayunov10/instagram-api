import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import { randomUUID } from 'crypto';

import { TestManager } from '../../base/managers/test.manager';
import {
  userEmail1,
  username1,
  userNewPassword,
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
    await prismaClientSingleton.disconnect();
  });

  describe('negative', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should return 400 If the inputModel has incorrect value`, async () => {
      await agent
        .post(new_password_url)
        .send({
          newPassword: userNewPassword,
          recoveryCode: '', // incorrect value
        })
        .expect(400);
    });

    it(`should return 400 If the inputModel has incorrect value`, async () => {
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
          newPassword: 'new271543523', // incorrect value
          recoveryCode: recoveryCode,
        })
        .expect(400);

      await agent
        .post(new_password_url)
        .send({
          newPassword: '- 9Az*=)ИП', // incorrect value
          recoveryCode: recoveryCode,
        })
        .expect(400);

      await agent
        .post(new_password_url)
        .send({
          newPassword: '- 9Az*=)سيء', // incorrect value
          recoveryCode: recoveryCode,
        })
        .expect(400);

      await agent
        .post(new_password_url)
        .send({
          newPassword: '- 9Az* = )', // incorrect value
          recoveryCode: recoveryCode,
        })
        .expect(400);

      await agent
        .post(new_password_url)
        .send({
          newPassword: userNewPassword, // incorrect value
          recoveryCode: 'recoveryCode', // incorrect value
        })
        .expect(400);
    });

    it(`should return 400 when trying to new-password with 
             incorrect object key for body (newPassword & recoveryCode)`, async () => {
      await agent
        .post(new_password_url)
        .send({
          NewPassword: 'new271543523', // key incorrect
          recoveryCode: randomUUID(),
        })
        .expect(400);

      await agent
        .post(new_password_url)
        .send({
          newPassword: 'new271543523',
          RecoveryCode: randomUUID(), // key incorrect
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
          newPassword: userNewPassword,
          recoveryCode: recoveryCode,
        })
        .expect(204);
    }, 10000);
  });
});
