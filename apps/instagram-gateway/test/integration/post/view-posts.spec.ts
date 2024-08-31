import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import * as path from 'path';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import {
  createUserInput,
  createUserInput2,
} from '../../base/constants/tests-strings';
import { UserCredentialsType } from '../../base/types/testing.type';

import {
  post_photo_url,
  post_with_photo_url,
} from './create-post-with-photo.spec';

export const post_url = '/api/v1/post/';

describe('PostsController: /post/:userId, View posts by userId', (): void => {
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

  describe('negative', () => {
    let user: UserCredentialsType;
    let photoId;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
    });

    it(`should create post`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      photoId = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(201);

      await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'description',
          images: [photoId.body.imageId],
        })
        .expect(201);
    });

    it(`should not return posts if query sortDirection is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ sortDirection: 'ASC' }) // should be in lowercase
        .expect(400);
    });

    it(`should not return posts if query sortDirection is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ sortDirection: 'Asc' }) // should be in lowercase
        .expect(400);
    });

    it(`should not return posts if query sortDirection is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ sortDirection: 'DESC' }) // should be in lowercase
        .expect(400);
    });

    it(`should not return posts if query sortDirection is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ sortDirection: 'Desc' }) // should be in lowercase
        .expect(400);
    });

    it(`should not return posts if query sortField is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ sortField: 'createdat' }) // should contain PostSortFields enum values
        .expect(400);
    });

    it(`should not return posts if query sortField is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ sortField: 'someField' }) // should contain PostSortFields enum values
        .expect(400);
    });

    it(`should not return posts if query sortField is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ sortField: 'AUTHOR_ID' }) // should contain PostSortFields enum values
        .expect(400);
    });

    it(`should not return posts if query sortField is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ sortField: 'authorid' }) // should contain PostSortFields enum values
        .expect(400);
    });

    it(`should not return posts if query sortField is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ sortField: 'UPDATED_AT' }) // should contain PostSortFields enum values
        .expect(400);
    });

    it(`should not return posts if query sortField is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ sortField: 'updatedat' }) // should contain PostSortFields enum values
        .expect(400);
    });

    it(`should not return posts if query pageSize is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ pageSize: '1s' }) // should not be NaN
        .expect(400);
    });

    it(`should not return posts if query page is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ page: true }) // should not be NaN
        .expect(400);
    });

    it(`should not return posts if query pageSize is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ pageSize: -1 }) // incorrect
        .expect(400);
    });

    it(`should not return posts if query page is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ page: -1 }) // incorrect
        .expect(400);
    });

    it(`should not return posts if query page is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ page: 0 }) // incorrect
        .expect(400);
    });

    it(`should not return posts if query page is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ pageSize: 10, page: 999999999999999 }) // incorrect
        .expect(400);
    });

    it(`should not return posts if query pageSize is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${user.id}`)
        .query({ page: 10, pageSize: 99999999999 }) // incorrect
        .expect(400);
    });

    it(`should not return posts if param userId is incorrect`, async (): Promise<void> => {
      await agent
        .get(`${post_url}${'incorrect'}`) // incorrect
        .expect(404);
    });
  });

  describe('positive', () => {
    let user: UserCredentialsType;
    let user2: UserCredentialsType;

    let photoId: string;
    let photoId2: string;
    let photoId3: string;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create 2 users`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
      user2 = await testManager.createUser(createUserInput2);
    });

    it(`should create a post by userid and add two images`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');
      const imagePath2 = path.join(__dirname, '../../base/assets/node.jpg');

      const response = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(201);

      photoId = response.body.imageId;

      const response2 = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath2)
        .expect(201);

      photoId2 = response2.body.imageId;

      await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'description post by user',
          images: [photoId, photoId2],
        })
        .expect(201);
    });

    it(`should create a post2 by userId and add one image`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      const response = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(201);

      photoId = response.body.imageId;

      await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'description post2 by user',
          images: [photoId],
        })
        .expect(201);
    });

    it(`should create a post by userId2 and add one image`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      const response = await agent
        .post(post_photo_url)
        .auth(user2.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(201);

      photoId3 = response.body.imageId;

      await agent
        .post(post_with_photo_url)
        .auth(user2.accessToken, { type: 'bearer' })
        .send({
          description: 'description post by user2',
          images: [photoId3],
        })
        .expect(201);
    });

    it(`should return posts by userId`, async (): Promise<void> => {
      const response = await agent.get(`${post_url}${user.id}`).expect(201);

      expect(response.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 8,
        totalCount: 2,
        items: [
          {
            id: expect.any(String),
            description: 'description post2 by user',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            authorId: user.id,
            username: createUserInput.username,
            images: [expect.any(String)],
          },
          {
            id: expect.any(String),
            description: 'description post by user',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            authorId: user.id,
            username: createUserInput.username,
            images: [expect.any(String), expect.any(String)],
          },
        ],
      });
    });
  });
});
