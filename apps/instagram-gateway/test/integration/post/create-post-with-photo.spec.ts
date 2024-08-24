import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import * as path from 'path';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { createUserInput } from '../../base/constants/tests-strings';
import { UserCredentialsType } from '../../base/types/testing.type';
import { expectPhotoId } from '../../base/utils/post/expectPhotoId';
import { expectCreatedPostWithPhoto } from '../../base/utils/post/expectCreatedPostWithPhoto';

export const post_photo_url = '/api/v1/post/photo/';
export const post_with_photo_url = '/api/v1/post/';

describe('PostsController: /post/photo; /post;', (): void => {
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

    it(`should not Upload post photo if bearer token is missing`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      await agent
        .post(post_photo_url)
        // .auth(user.accessToken, { type: 'bearer' }) // missing
        .attach('file', imagePath)
        .expect(401);
    });

    it(`should not Upload post photo if token has incorrect type`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      await agent
        .post(post_photo_url)
        .auth(user.accessToken + imagePath, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(401);
    });

    it(`should not Upload post photo if file is missing`, async (): Promise<void> => {
      // const imagePath = path.join(__dirname, '../../base/assets/node.png');

      await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        // .attach('file', imagePath) // missing
        .expect(400);
    });

    it(`should not Upload post photo if field file is missing`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('photo', imagePath) // missing
        .expect(400);
    });

    it(`should not Upload post photo if file has incorrect type`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/rocket.svg');

      await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(400);
    });

    it(`should not Upload post photo if file is undefined`, async (): Promise<void> => {
      const imagePath = undefined;

      await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(400);
    });

    it(`should not Upload post photo if file is an empty string`, async (): Promise<void> => {
      await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', '')
        .expect(400);
    });

    it(`should not create post if bearer token is missing`, async (): Promise<void> => {
      await agent
        .post(post_with_photo_url)
        // .auth(user.accessToken, { type: 'bearer' }) // missing
        .send({
          description: 'description',
          images: ['663bcaddfe047e8b75000db4'],
        })
        .expect(401);
    });

    it(`should not create post if bearer token is incorrect`, async (): Promise<void> => {
      await agent
        .post(post_with_photo_url)
        .auth('incorrect-accessToken', { type: 'bearer' }) // incorrect
        .send({
          description: 'description',
          images: ['663bcaddfe047e8b75000db4'],
        })
        .expect(401);
    });

    it(`should not create post if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 7, // incorrect
          images: ['663bcaddfe047e8b75000db4'],
        })
        .expect(400);
    });

    it(`should not create post if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: true, // incorrect
          images: ['663bcaddfe047e8b75000db4'],
        })
        .expect(400);
    });

    it(`should not create post if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: { key: 'value' }, // incorrect
          images: ['663bcaddfe047e8b75000db4'],
        })
        .expect(400);
    });

    it(`should not create post if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: { key: 'cd ..' }, // incorrect
          images: ['663bcaddfe047e8b75000db4'],
        })
        .expect(400);
    });

    it(`should not create post if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'a',
          images: ['663bcaddfe047e8b75000db'], // incorrect id
        })
        .expect(400);
    });

    it(`should not create post if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'a',
          images: ['663bcaddfe047e8b75000db-dfaf2'], // incorrect id
        })
        .expect(400);
    });

    it(`should not create post if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'a',
          images: [1, 2, 3], // incorrect ids
        })
        .expect(400);
    });

    it(`should not create post if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'a',
          images: [
            '663bcaddfe047e8b75000db4',
            '663bcaddfe047e8b75000db4',
            '663bcaddfe047e8b75000db4',
            '663bcaddfe047e8b75000db4',
            '663bcaddfe047e8b75000db4',
            '663bcaddfe047e8b75000db4',
            '663bcaddfe047e8b75000db4',
            '663bcaddfe047e8b75000db4',
            '663bcaddfe047e8b75000db4',
            '663bcaddfe047e8b75000db4',
            '663bcaddfe047e8b75000db4',
          ], // more than 10 ids
        })
        .expect(400);
    });

    it(`should not create post if input model has incorrect values`, async (): Promise<void> => {
      await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          images: [], // incorrect
        })
        .expect(400);
    });
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    let user: UserCredentialsType;
    let photoId;

    it(`should create user`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
    });

    it(`should Upload post photo`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      photoId = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(201);

      expectPhotoId(photoId);
    });

    it(`should create post with photo`, async (): Promise<void> => {
      const response = await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'a',
          images: [photoId.body.imageId],
        })
        .expect(201);

      expectCreatedPostWithPhoto(response, user.id, 'image.url', 1, 'a');
    });

    it(`should create post with photo | without description`, async (): Promise<void> => {
      const response = await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          images: [photoId.body.imageId],
        })
        .expect(201);

      expectCreatedPostWithPhoto(response, user.id, 'image.url', 1);
    });
  });
});
