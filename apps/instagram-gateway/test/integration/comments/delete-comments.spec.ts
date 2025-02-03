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
import { expectPhotoId } from '../../base/utils/post/expectPhotoId';
import {
  post_photo_url,
  post_with_photo_url,
} from '../post/create-post-with-photo.spec';

import { comments_url } from './create-comments.spec';

describe('CommentsController: DELETE /comments', (): void => {
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
    let postId;
    let commentId;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user and post with comment`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      photoId = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(201);

      expectPhotoId(photoId);

      const postResponse = await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'a',
          images: [photoId.body.imageId],
        })
        .expect(201);
      postId = postResponse.body.id;

      const commentResponse = await agent
        .post(comments_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ postId: postId, content: 'This is a comment' })
        .expect(201);
      commentId = commentResponse.body.id;
    });

    it(`should not delete comment if bearer token is incorrect`, async (): Promise<void> => {
      await agent
        .delete(`${comments_url}/${commentId}`)
        .auth('incorrect-accessToken', { type: 'bearer' }) // incorrect token
        .expect(401);
    });

    it(`should not delete comment if comment does not exist`, async (): Promise<void> => {
      await agent
        .delete(`${comments_url}/non-existent-comment-id`)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(404);
    });
  });

  describe('positive', () => {
    let user: UserCredentialsType;
    let user2: UserCredentialsType;

    let photoId;
    let postId;
    let commentId;
    let commentId2;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user, post, and comment`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      photoId = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(201);

      expectPhotoId(photoId);

      const postResponse = await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'a',
          images: [photoId.body.imageId],
        })
        .expect(201);
      postId = postResponse.body.id;

      const commentResponse = await agent
        .post(comments_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ postId: postId, content: 'This is a comment' })
        .expect(201);
      commentId = commentResponse.body.id;
    });

    it(`should create comment user 2 for post`, async (): Promise<void> => {
      user2 = await testManager.createUser(createUserInput2);
      const commentResponse = await agent
        .post(comments_url)
        .auth(user2.accessToken, { type: 'bearer' })
        .send({ postId: postId, content: 'This is a comment' })
        .expect(201);
      commentId2 = commentResponse.body.id;
    });

    it(`should delete comment successfully`, async (): Promise<void> => {
      await agent
        .delete(`${comments_url}/${commentId}`)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(204);

      // Verify comment is deleted
      await agent
        .put(`${comments_url}/${commentId}`)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ content: 'Updated comment content' })
        .expect(404);
    });

    it(`deleting comments on a post by other users, by the author of the post itself`, async (): Promise<void> => {
      await agent
        .delete(`${comments_url}/${commentId2}`)
        .auth(user.accessToken, { type: 'bearer' })
        .expect(204);

      // Verify comment is deleted
      await agent
        .put(`${comments_url}/${commentId2}`)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ content: 'Updated comment content' })
        .expect(404);
    });
  });
});
