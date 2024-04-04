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
} from '../../base/constants/tests-strings';

describe('AuthController: /registration', () => {
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

  describe('negative', () => {
    it(`should clear database`, async () => {
      await agent.delete('/testing/all-data');
    });

    it(`should return 400 when trying to Register in the system with empty username`, async () => {
      const response = await agent
        .post('/auth/registration')
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
        .post('/auth/registration')
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
        .post('/auth/registration')
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
        .post('/auth/registration')
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
        .post('/auth/registration')
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
        .post('/auth/registration')
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
        .post('/auth/registration')
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
        .post('/auth/registration')
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
        .post('/auth/registration')
        .send({
          username: lorem10,
          password: lorem20,
          email: 'some-gmail.com',
        })
        .expect(400);

      expectErrorMessages(response, 'email');
    });
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/testing/all-data');
    });

    it(`should return 204 when trying to Register in the system`, async () => {
      await agent
        .post('/auth/registration')
        .send({
          username: 'userLogin1',
          password: 'userPassword',
          email: userEmail1,
        })
        .expect(204);
    });
  });
});
