import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { beforeAllConfig } from '../../base/settings/before-all-config';
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
import { SendRegistrationMailUseCase } from '../../../src/features/mail/application/use-cases/send-registration-mail.use-case';
import { TestManager } from '../../base/managers/test.manager';

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
      await agent.delete('/testing/all-data');
    });

    it(`should return 400 when trying to Register in the system with empty email`, async () => {
      const response = await agent
        .post('/auth/login')
        .send({
          password: 'password123',
          email: '',
        })
        .expect(400);

      expectErrorMessages(response, 'email');
    });

    it(`should return 400 when trying to Register in the system with incorrect email`, async () => {
      const response = await agent
        .post('/auth/login')
        .send({
          password: 'password123',
          email: '11leto111@mailcom',
        })
        .expect(400);

      expectErrorMessages(response, 'username');
    });

    it(`should return 400 when trying to Register in the system with empty password`, async () => {
      const response = await agent
        .post('/auth/login')
        .send({
          password: '',
          email: '11leto111@gmail.com',
        })
        .expect(400);

      expectErrorMessages(response, 'username');
    });



    it(`should return 401 If the password or login is wrong`, async () => {
      const res = await agent
      .post('/auth/registration')
      .send({
        username: username1,
        password: userPassword,
        email: userEmail1,
      })
      .expect(204);

      const response = await agent
        .post('/auth/login')
        .send({
          password: 'incorrect password',
          email: userEmail1,
        })
        .expect(401);

    });
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/testing/all-data');
    });

    it(`should return 200 The user has successfully logged in`, async () => {
      const res = await agent
      .post('/auth/registration')
      .send({
        username: username1,
        password: userPassword,
        email: userEmail1,
      })
      .expect(204);
      
      await agent
        .post('/auth/login')
        .send({
          password: userPassword,
          email: userEmail1,
        })
        .expect(200);
    });

  });
});
