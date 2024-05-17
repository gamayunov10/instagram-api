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
import { PostViewModel } from '../../../src/features/post/models/output/post.view.model';

import {
  post_photo_url,
  post_with_photo_url,
} from './create-post-with-photo.spec';
import { post_url } from './view-posts.spec';

describe('PostController: /post/:id, delete post', (): void => {
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
    let user2: UserCredentialsType;
    let photoId;
    let post: PostViewModel;

    it(`should clear database`, async (): Promise<void> => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create 2 users`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
      user2 = await testManager.createUser(createUserInput2);
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
          description: 'a',
          images: [photoId.body.imageId],
        })
        .expect(201);

      post = result.body;
    });

    it(`should not delete post if bearer token is incorrect`, async (): Promise<void> => {
      await agent
        .delete(`${post_with_photo_url}${post.id}`)
        .auth('incorrect-accessToken', { type: 'bearer' }) //accessToken incorrect
        .expect(401);
    });

    it(`should not delete post if postId is incorrect`, async (): Promise<void> => {
      await agent
        .delete(`${post_with_photo_url}${123}`) //postId incorrect
        .auth(user.accessToken, { type: 'bearer' })
        .expect(404);
    });

    it(`should not delete, the user is trying to change a post that belongs to another user
 `, async (): Promise<void> => {
      await agent
        .delete(`${post_with_photo_url}${post.id}`)
        .auth(user2.accessToken, { type: 'bearer' }) // incorrect another user
        .expect(403);
    });
  });

  describe('positive', () => {
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
          description: 'a',
          images: [photoId.body.imageId],
        })
        .expect(201);

      post = result.body;
    });

    it(`deleting a post returns 204, and trying to update the deleted post returns 404`, async (): Promise<void> => {
      await agent
        .delete(`${post_with_photo_url}${post.id}`)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(204); // deleting a post

      const response = await agent.get(`${post_url}${user.id}`).expect(201);

      expect(response.body).toEqual({}); // getting a non-existent post

      await agent
        .delete(`${post_with_photo_url}${post.id}`)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(404); //delete a non-existent post
    });
  });
});
