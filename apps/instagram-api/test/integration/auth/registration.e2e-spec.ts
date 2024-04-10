import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { SendRegistrationMailUseCase } from '../../../src/features/mail/application/use-cases/send-registration-mail.use-case';
import { expectErrorMessages } from '../../base/utils/expectErrorMessages';
import {
  lorem10,
  lorem20,
  lorem30,
  lorem50,
  userEmail1,
  userEmail2,
  username1,
  username2,
  userPassword,
} from '../../base/constants/tests-strings';
import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';

export const registration_url = '/api/v1/auth/registration';

describe('AuthController: /registration', () => {
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

    it(`should return 400 when trying to Register in the system with empty username`, async () => {
      const response = await agent
        .post(registration_url)
        .send({
          username: '',
          password: 'password123',
          email: '11leto111@gmail.com',
        })
        .expect(400);

      expectErrorMessages(response, 'username');
    });

    it(`should return 400 when trying to Register in the system with incorrect username`, async () => {
      const response = await agent
        .post(registration_url)
        .send({
          username: 'qw', //minLength: 3
          password: 'password123',
          email: '11leto111@gmail.com',
        })
        .expect(400);

      expectErrorMessages(response, 'username');
    });

    it(`should return 400 when trying to Register in the system with incorrect username`, async () => {
      const response = await agent
        .post(registration_url)
        .send({
          username: lorem50, //maxLength: 30
          password: 'password123',
          email: '11leto111@gmail.com',
        })
        .expect(400);

      expectErrorMessages(response, 'username');
    });

    it(`should return 400 when trying to Register in the system with empty password`, async () => {
      const response = await agent
        .post(registration_url)
        .send({
          username: lorem10,
          password: '',
          email: 'some@gmail.com',
        })
        .expect(400);

      expectErrorMessages(response, 'password');
    });

    it(`should return 400 when trying to Register in the system with incorrect password`, async () => {
      const response = await agent
        .post(registration_url)
        .send({
          username: lorem10,
          password: '12345', //minLength: 6
          email: 'some@gmail.com',
        })
        .expect(400);

      expectErrorMessages(response, 'password');
    });

    it(`should return 400 when trying to Register in the system with incorrect password`, async () => {
      const response = await agent
        .post(registration_url)
        .send({
          username: lorem10,
          password: lorem30, //maxLength: 20
          email: 'some@gmail.com',
        })
        .expect(400);

      expectErrorMessages(response, 'password');
    });

    it(`should return 400 when trying to Register in the system with empty email`, async () => {
      const response = await agent
        .post(registration_url)
        .send({
          username: lorem10,
          password: lorem20,
          email: '',
        })
        .expect(400);

      expectErrorMessages(response, 'email');
    });

    it(`should return 400 when trying to Register in the system with incorrect email`, async () => {
      const response = await agent
        .post(registration_url)
        .send({
          username: lorem10,
          password: lorem20,
          email: 'some@gmail',
        })
        .expect(400);

      expectErrorMessages(response, 'email');
    });

    it(`should return 400 when trying to Register in the system with incorrect email`, async () => {
      const response = await agent
        .post(registration_url)
        .send({
          username: lorem10,
          password: lorem20,
          email: 'some-gmail.com',
        })
        .expect(400);

      expectErrorMessages(response, 'email');
    });

    it(`should return 400 when trying to Register in the system with incorrect email`, async () => {
      const response = await agent
        .post(registration_url)
        .send({
          username: lorem10,
          password: lorem20,
          email: 'l.gmail',
        })
        .expect(400);

      expectErrorMessages(response, 'email');
    });
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should return 204 when trying to Register in the system`, async () => {
      await agent
        .post(registration_url)
        .send({
          username: username1,
          password: userPassword,
          email: userEmail1,
        })
        .expect(204);
    });

    it(`should return 204 when trying to Register in the system, 
    SendRegistrationMailUseCase should be called`, async () => {
      const executeSpy = jest.spyOn(
        SendRegistrationMailUseCase.prototype,
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

      const confirmationCode =
        await testManager.getEmailConfirmationCode(userEmail2);

      expect(executeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          username: username2,
          email: userEmail2,
          confirmationCode: confirmationCode,
        }),
      );

      executeSpy.mockClear();
    }, 15000);
  });
});
