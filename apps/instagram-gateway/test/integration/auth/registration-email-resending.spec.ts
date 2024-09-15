import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import {
  userEmail2,
  userEmail3,
  username3,
  userPassword,
} from '../../base/constants/tests-strings';
import { expectErrorMessages } from '../../base/utils/expectErrorMessages';
import { SendRegistrationMailUseCase } from '../../../src/features/notifications/api/application/use-cases/send-registration-mail.use-case';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';

import { registration_url } from './registration.spec';

export const registration_email_resending_url =
  '/api/v1/auth/registration-email-resending';

describe('AuthController: /registration-email-resending', () => {
  let app: INestApplication;
  let agent: TestAgent<any>;

  beforeAll(async () => {
    const config = await beforeAllConfig();
    app = config.app;
    agent = config.agent;
  });

  afterAll(async () => {
    await app.close();
    await prismaClientSingleton.disconnect();
  });

  describe('negative', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should return 400 If the inputModel has incorrect values`, async () => {
      const response = await agent
        .post(registration_email_resending_url)
        .send({
          email: userEmail2,
        })
        .expect(400);

      expectErrorMessages(response, 'email');
    });

    it(`should return 400 when trying to registration-email-resending with 
    incorrect object key for body (email)`, async () => {
      const response = await agent
        .post(registration_email_resending_url)
        .send({
          Email: userEmail2, //key incorrect
        })
        .expect(400);

      expectErrorMessages(response, 'email');
    });
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`"should Resend confirmation registration Email, 
    SendRegistrationMailUseCase should be called`, async () => {
      await agent
        .post(registration_url)
        .send({
          username: username3,
          password: userPassword,
          email: userEmail3,
        })
        .expect(204);

      const executeSpy = jest.spyOn(
        SendRegistrationMailUseCase.prototype,
        'execute',
      );

      await agent
        .post(registration_email_resending_url)
        .send({ email: userEmail3 })
        .expect(204);

      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userEmail3,
        }),
      );

      executeSpy.mockClear();
    });
  });
});
