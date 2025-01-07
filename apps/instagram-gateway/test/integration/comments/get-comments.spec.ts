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
import {
  post_photo_url,
  post_with_photo_url,
} from '../post/create-post-with-photo.spec';
import { SortDirection } from '../../../src/base/enums/sort/sort.direction.enum';
import { CommentSortFields } from '../../../src/base/enums/sort/comment/comment.sort.fields.enum';

import { comments_url } from './create-comments.spec';

export const get_comments_url = '/api/v1/comments/post';

describe('CommentsController: /comments (Pagination)', (): void => {
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

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user and post`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      const photoId = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(201);

      const postResponse = await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'Test Post',
          images: [photoId.body.imageId],
        })
        .expect(201);

      postId = postResponse.body.id;
    });

    it(`should not return comments if query parameters are invalid`, async (): Promise<void> => {
      await agent
        .get(`${get_comments_url}/${postId}`)
        .query({ page: 'invalid', pageSize: 'invalid' })
        .expect(400);
    });

    it(`should return empty list if no comments exist`, async (): Promise<void> => {
      const response = await agent
        .get(`${get_comments_url}/${postId}`)
        .query({ page: 1, pageSize: 5 })
        .expect(200);

      expect(response.body).toEqual({
        page: 1,
        pagesCount: 0,
        pageSize: 5,
        totalCount: 0,
        items: [],
      });
    });
  });

  describe('positive', () => {
    let user: UserCredentialsType;
    let user2: UserCredentialsType;

    let postId: string;

    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should create user and post`, async (): Promise<void> => {
      user = await testManager.createUser(createUserInput);
      user2 = await testManager.createUser(createUserInput2);

      const imagePath = path.join(__dirname, '../../base/assets/node.png');

      const photoId = await agent
        .post(post_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .attach('file', imagePath)
        .expect(201);

      const postResponse = await agent
        .post(post_with_photo_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          description: 'Test Post',
          images: [photoId.body.imageId],
        })
        .expect(201);

      postId = postResponse.body.id;
    });

    it(`should create multiple comments`, async (): Promise<void> => {
      const comments = [
        { content: 'Comment 1 by user', authorId: user },
        { content: 'Comment 1 by user2', authorId: user2 },
        { content: 'Comment 2 by user', authorId: user },
      ];

      await agent
        .post(comments_url)
        .auth(comments[0].authorId.accessToken, { type: 'bearer' })
        .send({ postId: postId, content: comments[0].content })
        .expect(201);

      await agent
        .post(comments_url)
        .auth(comments[1].authorId.accessToken, { type: 'bearer' })
        .send({ postId: postId, content: comments[1].content })
        .expect(201);

      await agent
        .post(comments_url)
        .auth(comments[2].authorId.accessToken, { type: 'bearer' })
        .send({ postId: postId, content: comments[2].content })
        .expect(201);
    });

    it(`should sort comments by CREATED_AT`, async (): Promise<void> => {
      const response = await agent
        .get(`${get_comments_url}/${postId}`)
        .query({
          sortBy: CommentSortFields.CREATED_AT,
          sortDirection: SortDirection.ASC,
          page: 1,
          pageSize: 3,
        })
        .expect(200);

      expect(response.body.items).toEqual([
        {
          id: expect.any(String),
          content: 'Comment 1 by user',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          authorId: user.id,
          postId: postId,
          parentId: null,
        },
        {
          id: expect.any(String),
          content: 'Comment 1 by user2',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          authorId: user2.id,
          postId: postId,
          parentId: null,
        },
        {
          id: expect.any(String),
          content: 'Comment 2 by user',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          authorId: user.id,
          postId: postId,
          parentId: null,
        },
      ]);
    });
  });
});
