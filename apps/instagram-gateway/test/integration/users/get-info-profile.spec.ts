import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import path from 'path';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { UserCredentialsType } from '../../base/types/testing.type';
import {
  createUserInput,
  userProfileInputModel,
} from '../../base/constants/tests-strings';

import { fill_out_profile_url } from './fill-out-profile.spec';
import { upload_user_photo_url } from './upload-user-photo.spec';

export const get_profile_info_url = '/api/v1/user/profile-information';

describe('UsersController: /profile-information', () => {
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

    it(`should return 401 access token is missing`, async () => {
      await agent.get(get_profile_info_url).expect(401);
    });

    it(`should return 401 access token is invalid`, async () => {
      await agent
        .get(get_profile_info_url)
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

      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      await agent
        .post(upload_user_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(204);
    });

    it(`should return 200 and get profile info`, async () => {
      const result = await agent
        .get(get_profile_info_url)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(200);

      expect(result.body).toEqual({
        username: userProfileInputModel.username,
        firstName: userProfileInputModel.firstName,
        lastName: userProfileInputModel.lastName,
        dateOfBirth: userProfileInputModel.dateOfBirth,
        city: userProfileInputModel.city,
        aboutMe: userProfileInputModel.aboutMe,
        avatar: { url: expect.any(String) },
      });
    });
  });
});
