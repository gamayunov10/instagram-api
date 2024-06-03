import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { UserCredentialsType } from '../../base/types/testing.type';
import {
  createUserInput,
  createUserInput2,
  lorem100,
  lorem1000,
  userProfileInputModel,
  userProfileInputModel2,
} from '../../base/constants/tests-strings';
import { expectErrorMessages } from '../../base/utils/expectErrorMessages';
import { expectUserProfile } from '../../base/utils/user/expectUserProfile';

export const fill_out_profile_url = '/api/v1/user/fill-out-profile';

describe('UsersController: /fill-out-profile', () => {
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
    let user: UserCredentialsType;
    let user2: UserCredentialsType;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create 2 users`, async () => {
      user = await testManager.createUser(createUserInput);
      user2 = await testManager.createUser(createUserInput2);
    });

    it(`should return 401 access token is missing`, async () => {
      await agent
        .put(fill_out_profile_url)
        .send({
          username: 'username',
          firstName: 'firstName',
          lastName: 'firstName',
          dateOfBirth: '17.05.2010',
          city: 'q',
          aboutMe: 'only human after all',
        })
        .expect(401);
    });

    it(`should return 401 access token is invalid`, async () => {
      await agent
        .put(fill_out_profile_url)
        .auth('my-super-unexpected-token', { type: 'bearer' })
        .send({
          username: 'username',
          firstName: 'firstName',
          lastName: 'firstName',
          dateOfBirth: '17.05.2010',
          city: 'q',
          aboutMe: 'only human after all',
        })
        .expect(401);
    });

    it(`should return 400 user trying to use username that already exist in the system`, async () => {
      await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'username',
          firstName: 'firstName',
          lastName: 'firstName',
          dateOfBirth: '17.05.2010',
          city: 'q',
          aboutMe: 'only human after all',
        })
        .expect(204);

      const result = await agent
        .put(fill_out_profile_url)
        .auth(user2.accessToken, { type: 'bearer' })
        .send({
          username: 'username',
          firstName: 'firstName',
          lastName: 'firstName',
          dateOfBirth: '17.05.2010',
          city: 'q',
          aboutMe: 'only human after all',
        })
        .expect(400);

      expectErrorMessages(result, 'username');
    });

    it(`should return 400 if input model has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'DiegoM',
          firstName: 'Armando10', // A-Z; a-z;
          lastName: 'YouKnow',
          dateOfBirth: '30.10.1960',
          city: 'q',
          aboutMe: 'The Best Player Ever',
        })
        .expect(400);

      expectErrorMessages(result, 'firstName');
    });

    it(`should return 400 if input model has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'DiegoM',
          firstName: 'Armando',
          lastName: 'YouKnow10', // A-Z; a-z;
          dateOfBirth: '30.10.1960',
          city: 'q',
          aboutMe: 'The Best Player Ever',
        })
        .expect(400);

      expectErrorMessages(result, 'lastName');
    });

    it(`should return 400 if input model has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'DiegoM',
          firstName: '', // min length 1
          lastName: 'YouKnow',
          dateOfBirth: '30.10.1960',
          city: 'q',
          aboutMe: 'The Best Player Ever',
        })
        .expect(400);

      expectErrorMessages(result, 'firstName');
    });

    it(`should return 400 if input model has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'DiegoM',
          firstName: 'Armando',
          lastName: '', // min length 1
          dateOfBirth: '30.10.1960',
          city: 'q',
          aboutMe: 'The Best Player Ever',
        })
        .expect(400);

      expectErrorMessages(result, 'lastName');
    });

    it(`should return 400 if input model has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'DiegoM',
          firstName: 'Armando',
          lastName: lorem100, // max length 50
          dateOfBirth: '30.10.1960',
          city: 'q',
          aboutMe: 'The Best Player Ever',
        })
        .expect(400);

      expectErrorMessages(result, 'lastName');
    });

    it(`should return 400 if input model has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'DiegoM',
          firstName: lorem100, // max length 50
          lastName: 'YouKnow',
          dateOfBirth: '30.10.1960',
          city: 'q',
          aboutMe: 'The Best Player Ever',
        })
        .expect(400);

      expectErrorMessages(result, 'firstName');
    });

    it(`should return 400 if input model has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'Diego', // min length 6
          firstName: 'Armando',
          lastName: 'YouKnow',
          dateOfBirth: '30.10.1960',
          city: 'q',
          aboutMe: 'The Best Player Ever',
        })
        .expect(400);

      expectErrorMessages(result, 'username');
    });

    it(`should return 400 if input model has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: lorem100, // max length 30
          firstName: 'Armando',
          lastName: 'YouKnow',
          dateOfBirth: '30.10.1960',
          city: 'q',
          aboutMe: 'The Best Player Ever',
        })
        .expect(400);

      expectErrorMessages(result, 'username');
    });

    it(`should return 400 if input model has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'Diego@', // 0-9; A-Z; a-z; _ ; -
          firstName: 'Armando',
          lastName: 'YouKnow',
          dateOfBirth: '30.10.1960',
          city: 'q',
          aboutMe: 'The Best Player Ever',
        })
        .expect(400);

      expectErrorMessages(result, 'username');
    });

    it(`should return 400 if dateOfBirth has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'DiegoM',
          firstName: 'Armando',
          lastName: 'YouKnow',
          dateOfBirth: '30-10-1960', // dd.mm.хххх
          city: 'q',
          aboutMe: 'The Best Player Ever',
        })
        .expect(400);

      expectErrorMessages(result, 'dateOfBirth');
    });

    it(`should return 400 if dateOfBirth has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'DiegoM',
          firstName: 'Armando',
          lastName: 'YouKnow',
          dateOfBirth: '32.10.1960', // dd.mm.хххх
          city: 'q',
          aboutMe: 'The Best Player Ever',
        })
        .expect(400);

      expectErrorMessages(result, 'dateOfBirth');
    });

    it(`should return 400 if dateOfBirth has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'DiegoM',
          firstName: 'Armando',
          lastName: 'YouKnow',
          dateOfBirth: '31.14.1960', // dd.mm.хххх
          city: 'q',
          aboutMe: 'The Best Player Ever',
        })
        .expect(400);

      expectErrorMessages(result, 'dateOfBirth');
    });

    it(`should return 400 if dateOfBirth has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'DiegoM',
          firstName: 'Armando',
          lastName: 'YouKnow',
          dateOfBirth: '31.12.19600', // dd.mm.хххх
          city: 'q',
          aboutMe: 'The Best Player Ever',
        })
        .expect(400);

      expectErrorMessages(result, 'dateOfBirth');
    });

    it(`should return 400 if dateOfBirth has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'DiegoM',
          firstName: 'Armando',
          lastName: 'YouKnow',
          dateOfBirth: '31.12.2015', // under 13
          city: 'q',
          aboutMe: 'The Best Player Ever',
        })
        .expect(400);

      expectErrorMessages(result, 'dateOfBirth');
    });

    it(`should return 400 if input model has incorrect values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'DiegoM',
          firstName: 'Armando',
          lastName: 'YouKnow',
          dateOfBirth: '31.10.1960',
          city: 'q',
          aboutMe: lorem1000, // max length 200
        })
        .expect(400);

      expectErrorMessages(result, 'aboutMe');
    });

    it(`should return 400 if input model not contain mandatory values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          // username: 'DiegoM', // mandatory
          firstName: 'Armando',
          lastName: 'YouKnow',
          dateOfBirth: '31.10.1960',
          city: 'q',
        })
        .expect(400);

      expectErrorMessages(result, 'username');
    });

    it(`should return 400 if input model not contain mandatory values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'DiegoM',
          // firstName: 'Armando', // mandatory
          lastName: 'YouKnow',
          dateOfBirth: '31.10.1960',
          city: 'q',
        })
        .expect(400);

      expectErrorMessages(result, 'firstName');
    });

    it(`should return 400 if input model not contain mandatory values`, async () => {
      const result = await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          username: 'DiegoM',
          firstName: 'Armando',
          // lastName: 'YouKnow', // mandatory
          dateOfBirth: '31.10.1960',
          city: 'q',
        })
        .expect(400);

      expectErrorMessages(result, 'lastName');
    });
  });

  describe('positive', () => {
    let user: UserCredentialsType;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user`, async () => {
      user = await testManager.createUser(createUserInput);
    });

    it(`should return 204 if data is saved`, async () => {
      await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send(userProfileInputModel)
        .expect(204);

      const profile = await testManager.getUserProfile(createUserInput.email);

      expectUserProfile(profile, userProfileInputModel);
    });

    it(`should return 204, update lastName and firstName`, async () => {
      await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send(userProfileInputModel2)
        .expect(204);

      const profile = await testManager.getUserProfile(createUserInput.email);

      expectUserProfile(profile, userProfileInputModel2);
    });

    it(`should update unique username if it's belong one user`, async () => {
      await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send(userProfileInputModel)
        .expect(204);

      await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send(userProfileInputModel)
        .expect(204);

      const profile = await testManager.getUserProfile(createUserInput.email);

      expectUserProfile(profile, userProfileInputModel);
    });
  });
});
