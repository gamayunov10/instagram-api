import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import {
  createUserInput,
  createUserInput2,
} from '../../base/constants/tests-strings';
import { UserCredentialsType } from '../../base/types/testing.type';
import { expectCreatePaymentResponse } from '../../base/utils/subscriptions/expectCreatePaymentResponse';

export const create_payment_url = '/api/v1/subscriptions/create-payment/';

describe('Subscriptions: /create-payment;', (): void => {
  let app: INestApplication;
  let agent: TestAgent<any>;
  let testManager: TestManager;

  beforeAll(async (): Promise<void> => {
    const config = await beforeAllConfig();
    app = config.app;
    agent = config.agent;
    testManager = config.testManager;
  });

  afterAll(async () => {
    await app.close();
    await prismaClientSingleton.disconnect();
  });

  describe('negative', (): void => {
    it(`should clear database`, async (): Promise<void> => {
      await agent.delete('/api/v1/testing/all-data');
    });

    let user: UserCredentialsType;

    it(`should create user`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
    });

    it(`should not create-payment if bearer token is missing`, async (): Promise<void> => {
      await agent
        .post(create_payment_url)
        // .auth(user.accessToken, { type: 'bearer' }) // missing
        .expect(401);
    });

    it(`should not create-payment if token has incorrect type`, async (): Promise<void> => {
      await agent
        .post(create_payment_url)
        .auth(user.accessToken + '21121', { type: 'bearer' })
        .expect(401);
    });

    it(`should not create-payment if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(create_payment_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          subscriptionTimeType: 'day', // incorrect
          paymentType: 'STRIPE',
          paymentCount: 2,
        })
        .expect(400);
    });

    it(`should not create-payment if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(create_payment_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          subscriptionTimeType: 1, // incorrect
          paymentType: 'STRIPE',
          paymentCount: 2,
        })
        .expect(400);
    });

    it(`should not create-payment if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(create_payment_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          subscriptionTimeType: 'DAY',
          paymentType: 'MasterCard', // incorrect
          paymentCount: 2,
        })
        .expect(400);
    });

    it(`should not create-payment if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(create_payment_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          subscriptionTimeType: 'DAY',
          paymentType: 'STRIPE',
          paymentCount: true, // incorrect
        })
        .expect(400);
    });

    it(`should not create-payment if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(create_payment_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          subscriptionTimeType: 'DAY',
          paymentType: 'STRIPE',
          paymentCount: 0, // incorrect
        })
        .expect(400);
    });

    it(`should not create-payment if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(create_payment_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          subscriptionTimeType: 'DAY',
          paymentType: 'STRIPE',
          paymentCount: 12.95, // incorrect
        })
        .expect(400);
    });

    it(`should not create-payment if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(create_payment_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          subscriptionTimeType: 'DAY',
          paymentType: 'STRIPE',
          paymentCount: -3, // incorrect
        })
        .expect(400);
    });
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    let user: UserCredentialsType;
    let user2: UserCredentialsType;

    it(`should create 2 user`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
      user2 = await testManager.createUser(createUserInput2);
    });

    it(`should create-payment by STRIPE`, async (): Promise<void> => {
      const result = await agent
        .post(create_payment_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          subscriptionTimeType: 'DAY',
          paymentType: 'STRIPE',
          paymentCount: 1,
        })
        .expect(202);

      expectCreatePaymentResponse(result);
    });

    it(`should create-payment by PAYPAL`, async (): Promise<void> => {
      const result = await agent
        .post(create_payment_url)
        .auth(user2.accessToken, { type: 'bearer' })
        .send({
          subscriptionTimeType: 'DAY',
          paymentType: 'PAYPAL',
          paymentCount: 1,
          autoRenewal: false,
        })
        .expect(202);

      expectCreatePaymentResponse(result);
    });

    it(`should create auto subscription by STRIPE`, async (): Promise<void> => {
      const result = await agent
        .post(create_payment_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          subscriptionTimeType: 'DAY',
          paymentType: 'STRIPE',
          paymentCount: 1,
          autoRenewal: true,
        })
        .expect(202);

      expectCreatePaymentResponse(result);
    });
  });
});
