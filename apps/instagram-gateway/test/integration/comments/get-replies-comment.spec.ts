import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import path from 'path';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { createUserInput } from '../../base/constants/tests-strings';
import { UserCredentialsType } from '../../base/types/testing.type';
import { SortDirection } from '../../../src/base/enums/sort/sort.direction.enum';
import { CommentSortFields } from '../../../src/base/enums/sort/comment/comment.sort.fields.enum';
import {
  post_photo_url,
  post_with_photo_url,
} from '../post/create-post-with-photo.spec';

import { comments_url } from './create-comments.spec';

describe('CommentsController: /:commentId/replies', (): void => {
  let app: INestApplication;
  let agent: TestAgent<any>;
  let testManager: TestManager;
  let user: UserCredentialsType;
  let postId: string;
  let parentCommentId: string;

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

  it(`should create user, post, parent comment, and replies`, async (): Promise<void> => {
    await agent.delete('/api/v1/testing/all-data');

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

    const parentCommentResponse = await agent
      .post(comments_url)
      .auth(user.accessToken, { type: 'bearer' })
      .send({
        postId,
        content: 'Parent comment',
      })
      .expect(201);
    parentCommentId = parentCommentResponse.body.id;

    // Create multiple replies to the parent comment
    for (let i = 1; i <= 5; i++) {
      await agent
        .post(comments_url)
        .auth(user.accessToken, { type: 'bearer' })
        .send({
          postId,
          content: `Reply ${i}`,
          parentId: parentCommentId,
        })
        .expect(201);
    }
  });

  it(`should return 404 if commentId does not exist`, async (): Promise<void> => {
    const nonExistentCommentId = '00000000-0000-0000-0000-000000000000'; // Invalid UUID

    await agent
      .get(`/api/v1/comments/${nonExistentCommentId}/replies`)
      .query({
        sortBy: CommentSortFields.CREATED_AT,
        sortDirection: SortDirection.ASC,
        page: 1,
        pageSize: 3,
      })
      .expect(404);
  });

  it(`should get replies for a specific comment with pagination`, async (): Promise<void> => {
    const response = await agent
      .get(`/api/v1/comments/${parentCommentId}/replies`)
      .query({
        sortBy: CommentSortFields.CREATED_AT,
        sortDirection: SortDirection.ASC,
        page: 1,
        pageSize: 3,
      })
      .expect(200);

    expect(response.body).toEqual({
      items: [
        expect.objectContaining({
          content: 'Reply 1',
          parentId: parentCommentId,
        }),
        expect.objectContaining({
          content: 'Reply 2',
          parentId: parentCommentId,
        }),
        expect.objectContaining({
          content: 'Reply 3',
          parentId: parentCommentId,
        }),
      ],
      totalCount: 5,
      pagesCount: 2,
      page: 1,
      pageSize: 3,
    });
  });

  it(`should get the second page of replies`, async (): Promise<void> => {
    const response = await agent
      .get(`/api/v1/comments/${parentCommentId}/replies`)
      .query({
        sortBy: CommentSortFields.CREATED_AT,
        sortDirection: SortDirection.ASC,
        page: 2,
        pageSize: 3,
      })
      .expect(200);

    expect(response.body).toEqual({
      items: [
        expect.objectContaining({
          content: 'Reply 4',
          parentId: parentCommentId,
        }),
        expect.objectContaining({
          content: 'Reply 5',
          parentId: parentCommentId,
        }),
      ],
      totalCount: 5,
      pagesCount: 2,
      page: 2,
      pageSize: 3,
    });
  });
});
