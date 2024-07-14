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
import {
  post_photo_url,
  post_with_photo_url,
} from '../post/create-post-with-photo.spec';

import { upload_user_photo_url } from './upload-user-photo.spec';
import { fill_out_profile_url } from './fill-out-profile.spec';

export const view_user_public_url = '/api/v1/public-user/';

describe('PublicUsersController: /public-user', () => {
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

    it(`should return 404, there is no such username`, async () => {
      await agent.get(view_user_public_url + 'incorrect').expect(404);
    });
  });

  describe('positive', () => {
    let user: UserCredentialsType;
    let photoId;
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

    it(`getting data from a user's public page`, async () => {
      const result = await agent
        .get(view_user_public_url + `${userProfileInputModel.username}`)
        .expect(200);

      expect(result.body).toEqual({
        username: userProfileInputModel.username,
        aboutMe: userProfileInputModel.aboutMe,
        following: 0,
        followers: 0,
        publicationsCount: 0,
        publications: [],
        avatar: null,
      });
    });

    it(`uploading an avatar and creating posts`, async () => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      await agent
        .post(upload_user_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(204);

      photoId = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(201);

      await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'a',
          images: [photoId.body.imageId],
        })
        .expect(201);
    });

    it(`getting data from a user's public page after 
    uploading an avatar and creating a post`, async () => {
      const result = await agent
        .get(view_user_public_url + `${userProfileInputModel.username}`)
        .expect(200);

      expect(result.body).toEqual({
        username: userProfileInputModel.username,
        aboutMe: userProfileInputModel.aboutMe,
        following: 0,
        followers: 0,
        publicationsCount: 1, // we created one post
        publications: [
          {
            id: expect.any(String),
            authorId: expect.any(String),
            username: userProfileInputModel.username,
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            description: 'a',
            images: expect.any(Array),
          },
        ],
        avatar: { url: expect.any(String) },
      });
    });
  });
});
