import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { UserCredentialsType } from '../../base/types/testing.type';
import {
  createUserInput,
  userProfileInputModel,
} from '../../base/constants/tests-strings';

export const get_info_profile_url = '/api/v1/user/profile-information';
export const fill_out_profile_url = '/api/v1/user/fill-out-profile';

describe('UserController: /profile-information', () => {
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

    it(`should return 401 access token is missing`, async () => {
      await agent.get(get_info_profile_url).expect(401);
    });

    it(`should return 401 access token is invalid`, async () => {
      await agent
        .get(get_info_profile_url)
        .auth('my-super-unexpected-token', { type: 'bearer' })
        .expect(401);
    });
  });

  describe('positive', () => {
    let user: UserCredentialsType;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`creating a user and filling in data`, async () => {
      user = await testManager.createUser(createUserInput);
      await agent
        .put(fill_out_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send(userProfileInputModel)
        .expect(204);
    });

    it(`should return 200 and get profile info`, async () => {
      const result = await agent
        .get(get_info_profile_url)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(200);
      expect(result.body).toEqual({
        userName: userProfileInputModel.username,
        firstName: userProfileInputModel.firstName,
        lastName: userProfileInputModel.lastName,
        dateOfBirth: userProfileInputModel.dateOfBirth,
        city: userProfileInputModel.city,
        aboutMe: userProfileInputModel.aboutMe,
      });
    });
  });
});
