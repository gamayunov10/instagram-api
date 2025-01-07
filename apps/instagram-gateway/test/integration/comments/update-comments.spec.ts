import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import path from 'path';

import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { TestManager } from '../../base/managers/test.manager';
import { UserCredentialsType } from '../../base/types/testing.type';
import {
  createUserInput,
  createUserInput2,
} from '../../base/constants/tests-strings';
import {
  post_photo_url,
  post_with_photo_url,
} from '../post/create-post-with-photo.spec';
import { expectPhotoId } from '../../base/utils/post/expectPhotoId';

import { comments_url } from './create-comments.spec';

describe('CommentsController: /comments/:id', (): void => {
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
    let postId: string;
    let commentId: string;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user, post, and comment`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      const photoId = await agent
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

      const commentResponse = await agent
        .post(comments_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ postId: postId, content: 'Initial comment content' })
        .expect(201);

      commentId = commentResponse.body.id;
    });

    it(`should not update comment if bearer token is incorrect`, async (): Promise<void> => {
      await agent
        .put(`${comments_url}/${commentId}`)
        .auth('incorrect-accessToken', { type: 'bearer' }) // incorrect token
        .send({ content: 'Updated comment content' })
        .expect(401);
    });

    it(`should not update comment if content is missing`, async (): Promise<void> => {
      await agent
        .put(`${comments_url}/${commentId}`)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ content: '' }) // empty content
        .expect(400);
    });

    it(`should not update comment if comment does not exist`, async (): Promise<void> => {
      await agent
        .put(`${comments_url}/non-existent-comment-id`)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ content: 'Updated comment content' })
        .expect(404);
    });

    it(`should not update comment if user is not the author`, async (): Promise<void> => {
      const anotherUser = await testManager.createUser(createUserInput2);

      await agent
        .put(`${comments_url}/${commentId}`)
        .auth(anotherUser.accessToken, { type: 'bearer' })
        .send({ content: 'Updated comment content' })
        .expect(403);
    });
  });

  describe('positive', () => {
    let user: UserCredentialsType;
    let postId: string;
    let commentId: string;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user, post, and comment`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      const photoId = await agent
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

      const commentResponse = await agent
        .post(comments_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ postId: postId, content: 'Initial comment content' })
        .expect(201);

      commentId = commentResponse.body.id;
    });

    it(`should update comment`, async (): Promise<void> => {
      const updatedContent = 'Updated comment content';

      const updatedComment = await agent
        .put(`${comments_url}/${commentId}`)
        .auth(user.accessToken, { type: 'bearer' })
        .send({ content: updatedContent })
        .expect(200);

      expect(updatedComment.body).toEqual({
        id: commentId,
        content: updatedContent,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        authorId: user.id,
        postId: postId,
        parentId: null,
      });
    });
  });
});
