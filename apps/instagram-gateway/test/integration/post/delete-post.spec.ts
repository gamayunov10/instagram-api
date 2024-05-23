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
import { PostCleanupService } from '../../../src/features/post/api/application/post.cleanup.service';
import { expectPostsView } from '../../base/utils/post/expectPostsView';
import { expectPostById } from '../../base/utils/post/expectPostById';

import {
  post_photo_url,
  post_with_photo_url,
} from './create-post-with-photo.spec';
import { post_url } from './view-posts.spec';
import { public_posts_url } from './public-posts.spec';

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
        .auth('incorrect-accessToken', { type: 'bearer' }) // accessToken incorrect
        .expect(401);
    });

    it(`should not delete post if postId is incorrect`, async (): Promise<void> => {
      await agent
        .delete(`${post_with_photo_url}${post.id + 1}`) // postId incorrect
        .auth(user.accessToken, { type: 'bearer' })
        .expect(404);
    });

    it(`should not delete, the user is trying to change a post that belongs to another user`, async (): Promise<void> => {
      await agent
        .delete(`${post_with_photo_url}${post.id}`)
        .auth(user2.accessToken, { type: 'bearer' })
        .expect(403);
    });
  });

  describe('positive', () => {
    let user: UserCredentialsType;
    let photoId;
    let photoId2;
    let photoId3;
    let post: PostViewModel;
    let post2: PostViewModel;
    let post3: PostViewModel;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
    });

    it(`should create 3 posts`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');
      const imagePath2 = path.join(__dirname, '../../base/assets/node.png');

      // Upload first image and create first post
      photoId = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(201);

      const result = await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'Upload first post',
          images: [photoId.body.imageId],
        })
        .expect(201);

      // Upload second image and create second post
      photoId2 = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath2)
        .expect(201);

      const result2 = await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'Upload second post',
          images: [photoId2.body.imageId],
        })
        .expect(201);

      // Upload third image and third second post
      photoId3 = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath2)
        .expect(201);

      const result3 = await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'Upload third post',
          images: [photoId3.body.imageId],
        })
        .expect(201);

      post = result.body;

      post2 = result2.body;

      post3 = result3.body;
    });

    it(`should delete post`, async (): Promise<void> => {
      await agent
        .delete(`${post_with_photo_url}${post.id}`)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(204);

      const response = await agent.get(`${post_url}${user.id}`).expect(201);

      expectPostsView(response, 'Upload second post', user.id, '.png');

      await agent
        .delete(`${post_with_photo_url}${post.id}`)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(404); // delete a non-existent post
    });

    it(`Should return [] after running the database cleanup method`, async (): Promise<void> => {
      await testManager.updateDeletedAtForTests(post2.id);

      const cleanupService = app.get(PostCleanupService);

      await cleanupService.clearDeletedPostsFromDB();

      await agent.get(`${public_posts_url}${post.id}`).expect(404); // deleted

      await agent.get(`${public_posts_url}${post2.id}`).expect(404); // deleted

      const response = await agent
        .get(`${public_posts_url}${post3.id}`)
        .expect(200);

      expectPostById(response, 'Upload third post', user.id, '.png');
    });
  });
});
