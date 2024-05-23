import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import path from 'path';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import {
  createUserInput,
  createUserInput2,
} from '../../base/constants/tests-strings';
import { UserCredentialsType } from '../../base/types/testing.type';
import { PostViewModel } from '../../../src/features/post/models/output/post.view.model';
import { expectPostById } from '../../base/utils/post/expectPostById';

import {
  post_photo_url,
  post_with_photo_url,
} from './create-post-with-photo.spec';
import { public_posts_url } from './public-posts.spec';

describe('PublicPostController: /public-posts/:postId', (): void => {
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
    await prismaClientSingleton.getPrisma().$disconnect();
  });

  describe('negative', () => {
    let user: UserCredentialsType;
    let photoId;
    let post: PostViewModel;

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

      const result = await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'description',
          images: [photoId.body.imageId],
        })
        .expect(201);

      post = result.body;
    });

    it(`should not return posts if specified post does not exist`, async (): Promise<void> => {
      await agent.get(`${public_posts_url}id123`).expect(404);
    });
  });

  describe('positive', () => {
    let user: UserCredentialsType;
    let user2: UserCredentialsType;

    let photoId: string;
    let photoId2: string;

    let postId: string;
    let postId2: string;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create 2 users`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
      user2 = await testManager.createUser(createUserInput2);
    });

    it(`should create 2 posts`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');
      const imagePath2 = path.join(__dirname, '../../base/assets/node.jpg');

      const response = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(201);

      photoId = response.body.imageId;

      const post = await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'description a',
          images: [photoId],
        })
        .expect(201);

      postId = post.body.id;

      const response2 = await agent
        .post(post_photo_url)
        .auth(user2.accessToken, { type: 'bearer' })
        .attach('file', imagePath2)
        .expect(201);

      photoId2 = response2.body.imageId;

      const post2 = await agent
        .post(post_with_photo_url)
        .auth(user2.accessToken, { type: 'bearer' })
        .send({
          description: 'description b',
          images: [photoId2],
        })
        .expect(201);

      postId2 = post2.body.id;
    });

    it(`should return each post by id`, async (): Promise<void> => {
      const response = await agent
        .get(`${public_posts_url}${postId}`)
        .expect(200);

      expectPostById(response, 'description a', user.id, '.png');

      const response2 = await agent
        .get(`${public_posts_url}${postId2}`)
        .expect(200);

      expectPostById(response2, 'description b', user2.id, '.jpeg');
    });
  });
});
