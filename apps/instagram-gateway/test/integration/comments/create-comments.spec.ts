import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import path from 'path';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { createUserInput } from '../../base/constants/tests-strings';
import { UserCredentialsType } from '../../base/types/testing.type';
import { expectPhotoId } from '../../base/utils/post/expectPhotoId';
import {
  post_photo_url,
  post_with_photo_url,
} from '../post/create-post-with-photo.spec';

export const comments_url = '/api/v1/comments';

describe('CommentsController: /comments', (): void => {
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

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
    });

    it(`should not create comment if bearer token is incorrect`, async (): Promise<void> => {
      await agent
        .post(comments_url)
        .auth('incorrect-accessToken', { type: 'bearer' }) // incorrect token
        .send({ postId: 'post-id', content: 'This is a comment' })
        .expect(401);
    });

    it(`should not create comment if comment content is missing`, async (): Promise<void> => {
      await agent
        .post(comments_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ content: '' }) // empty content
        .expect(400);
    });

    it(`should not create comment if user tries to post to a non-existing post`, async (): Promise<void> => {
      await agent
        .post(comments_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ postId: 'postId', content: 'This is a comment' })
        .expect(404);
    });

    it(`should not create a comment if the user is trying to create a response for a non-existent comment.`, async (): Promise<void> => {
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      photoId = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(201);

      expectPhotoId(photoId);

      const response = await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'a',
          images: [photoId.body.imageId],
        })
        .expect(201);
      postId = response.body.id;

      await agent
        .post(comments_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          postId: postId,
          content: 'This is a comment',
          parentId: 'non-existent comment',
        })
        .expect(404);
    });
  });

  describe('positive', () => {
    let user: UserCredentialsType;
    let photoId;
    let postId;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user and comment`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      photoId = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(201);

      expectPhotoId(photoId);

      const response = await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'a',
          images: [photoId.body.imageId],
        })
        .expect(201);
      postId = response.body.id;

      const newComment = await agent
        .post(comments_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ postId: postId, content: 'This is a comment' })
        .expect(201);

      expect(newComment.body).toEqual({
        id: expect.any(String),
        content: 'This is a comment',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        authorId: user.id,
        postId: postId,
        parentId: null,
      });
    });
  });
});
