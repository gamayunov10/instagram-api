import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { SwaggerOptions } from '../../../infrastructure/decorators/swagger.decorator';
import { ApiErrorMessages } from '../../../base/schemas/api-error-messages.schema';
import { PostViewModel } from '../models/output/post.view.model';
import { PostQueryModel } from '../models/query/post.query.model';
import { PublicPostsSchema } from '../../../base/schemas/public.posts.schema';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception-handler';

import { PublicPostsGetCommand } from './application/use-cases/queryBus/public-posts-get-use.case';
import { PublicPostGetCommand } from './application/use-cases/queryBus/public-post-get-use.case';

@Controller('public-posts')
@ApiTags('Public posts')
export class PublicPostsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @SwaggerOptions(
    'View public posts',
    false,
    false,
    201,
    '',
    PublicPostsSchema,
    `If query params has incorrect values`,
    ApiErrorMessages,
    false,
    false,
    false,
    false,
  )
  @HttpCode(201)
  async getPosts(
    @Query() query: PostQueryModel,
  ): Promise<PostViewModel | void> {
    const result = await this.queryBus.execute(
      new PublicPostsGetCommand(query),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result.response;
  }

  @Get(':postId')
  @SwaggerOptions(
    'Get post by id',
    false,
    false,
    200,
    '',
    PostViewModel,
    false,
    false,
    false,
    false,
    'If specified post not found',
    false,
  )
  @HttpCode(200)
  async getPost(
    @Param('postId') postId: string,
  ): Promise<PostViewModel | void> {
    const result = await this.queryBus.execute(
      new PublicPostGetCommand(postId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result.response;
  }
}
