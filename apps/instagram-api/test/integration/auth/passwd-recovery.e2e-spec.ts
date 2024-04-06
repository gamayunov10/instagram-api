import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { beforeAllConfig } from '../../base/settings/before-all-config';
import { PasswordRecoveryUseCase } from '../../../src/features/auth/api/application/use-cases/password-recovery.use-case';
import { expectErrorMessages } from '../../base/utils/expectErrorMessages';
import {
  userEmail2,
  username2,
  userPassword,
} from '../../base/constants/tests-strings';

import { registration_url } from './registration.e2e-spec';

describe('AuthController: /password-recovery', () => {
  let app: INestApplication;
  let agent: TestAgent<any>;

  beforeAll(async () => {
    const config = await beforeAllConfig();
    app = config.app;
    agent = config.agent;
  });

  afterAll(async () => {
    await app.close();
  });

  const passwd_recovery_url = '/api/v1/auth/password-recovery';

  describe('negative', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should return 400 If the inputModel has invalid email, 
    PasswordRecoveryUseCase should not be called`, async () => {
      const executeSpy = jest.spyOn(
        PasswordRecoveryUseCase.prototype,
        'execute',
      );

      const response = await agent
        .post(passwd_recovery_url)
        .send({
          email: '',
          reCaptcha: 'reCaptcha',
        })
        .expect(400);

      expectErrorMessages(response, 'email');

      expect(executeSpy).not.toHaveBeenCalled();
    });

    it(`should return 400 If the inputModel has invalid email`, async () => {
      const executeSpy = jest.spyOn(
        PasswordRecoveryUseCase.prototype,
        'execute',
      );

      const response = await agent
        .post(passwd_recovery_url)
        .send({
          email: 'some@email',
        })
        .expect(400);

      expectErrorMessages(response, 'email');

      expect(executeSpy).not.toHaveBeenCalled();
    });
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should Confirm Password recovery, PasswordRecoveryUseCase should be called`, async () => {
      const executeSpy = jest.spyOn(
        PasswordRecoveryUseCase.prototype,
        'execute',
      );

      await agent
        .post(registration_url)
        .send({
          username: username2,
          password: userPassword,
          email: userEmail2,
        })
        .expect(204);

      await agent
        .post(passwd_recovery_url)
        .send({
          email: userEmail2,
          reCaptcha: 'reCaptcha',
        })
        .expect(204);

      expect(executeSpy).toHaveBeenCalled();
    });
  });
});
