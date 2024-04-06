import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { beforeAllConfig } from '../../base/settings/before-all-config';
import { expectErrorMessages } from '../../base/utils/expectErrorMessages';
import {
  userEmail1,
  username1,
  userPassword,
} from '../../base/constants/tests-strings';
import { TestManager } from '../../base/managers/test.manager';

import {
  registration_confirmation_url,
  registration_url,
} from './registration.e2e-spec';

const login_url = '/api/v1/auth/login';

describe('AuthController: /login', () => {
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

    it(`should return 400 when trying to Log in the system with empty email`, async () => {
      const response = await agent
        .post(login_url)
        .send({
          password: 'password123',
          email: '',
        })
        .expect(400);

      expectErrorMessages(response, 'email');
    });

    it(`should return 400 when trying to Log in the system with incorrect email`, async () => {
      const response = await agent
        .post(login_url)
        .send({
          password: 'password123',
          email: '11leto111@mailcom',
        })
        .expect(400);

      expectErrorMessages(response, 'email');
    });

    it(`should return 400 when trying to Log in the system with empty password`, async () => {
      const response = await agent
        .post(login_url)
        .send({
          password: '',
          email: '11leto111@gmail.com',
        })
        .expect(400);

      expectErrorMessages(response, 'password');
    });

    it(`should return 401 If the password or login is wrong`, async () => {
      await agent
        .post(registration_url)
        .send({
          username: username1,
          password: userPassword,
          email: userEmail1,
        })
        .expect(204);

      await agent
        .post(login_url)
        .send({
          password: 'incorrect password',
          email: userEmail1,
        })
        .expect(401);
    });
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should return 200 The user has successfully logged in`, async () => {
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
        .post(login_url)
        .send({
          password: userPassword,
          email: userEmail1,
        })
        .expect(200);
    });
  });
});
