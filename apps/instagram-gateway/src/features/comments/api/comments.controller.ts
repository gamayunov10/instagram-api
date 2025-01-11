import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  Delete,
  UseGuards,
  HttpCode,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { DeviceAuthSessionGuard } from '../../../infrastructure/guards/devie-auth-session.guard';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { CommentInputModel } from '../models/input/comment.input.model';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import { CommentUpdateModel } from '../models/input/comment.update.model';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception-handler';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger.decorator';
import { ApiErrorMessages } from '../../../base/schemas/api-error-messages.schema';
import { CommentViewModel } from '../models/output/comment.view.model';
import { CommentQueryModel } from '../models/query/comment.query.model';
import { CommentsSchema } from '../../../base/schemas/comments.schema';
import { RepliesQueryModel } from '../models/query/replies.query.model';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { GetUserIdByAuth } from '../../auth/guards/get-user.guard';

import { CreateCommentCommand } from './application/use-cases/commandBus/create-comment.use-case';
import { CommentService } from './application/comments.service';
import { UpdateCommentCommand } from './application/use-cases/commandBus/update-comment.use-case';
import { DeleteCommentCommand } from './application/use-cases/commandBus/delete-comment.use-case';
import { CommentsByPostGetCommand } from './application/use-cases/queryBus/get-comments-by-post.use-case';
import { RepliesByCommentGetCommand } from './application/use-cases/queryBus/get-replies-by-comment.use-case';

@Controller('comments')
@ApiTags('Comment')
export class CommentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly commentService: CommentService,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @SwaggerOptions(
    'Create comment',
    true,
    false,
    201,
    'Created',
    CommentViewModel,
    ` If input model has incorrect values`,
    ApiErrorMessages,
    true,
    false,
    true,
    false,
  )
  @UseGuards(DeviceAuthSessionGuard)
  @UseGuards(JwtBearerGuard)
  async create(
    @UserIdFromGuard() userId: string,
    @Body() commentInputModel: CommentInputModel,
  ) {
    const result = await this.commandBus.execute(
      new CreateCommentCommand(commentInputModel, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }
    return result.res;
  }

  @Get('post/:postId')
  @SwaggerOptions(
    'Get all comments for a specific post',
    false,
    false,
    201,
    '',
    CommentsSchema,
    ``,
    ApiErrorMessages,
    false,
    false,
    true,
    false,
  )
  @UseGuards(GetUserIdByAuth)
  async findCommentsByPostId(
    @Param('postId') postId: string,
    @Query() query: CommentQueryModel,
    @CurrentUserId() userId: string | null,
  ) {
    const comments = await this.queryBus.execute(
      new CommentsByPostGetCommand(postId, query, userId),
    );

    if (!comments.data) {
      return exceptionHandler(comments.code, comments.message, comments.field);
    }

    return comments.response;
  }

  @Get(':commentId/replies')
  @SwaggerOptions(
    'Get all replies for a specific comment',
    false,
    false,
    201,
    '',
    CommentsSchema,
    ``,
    ApiErrorMessages,
    false,
    false,
    true,
    false,
  )
  async findRepliesByCommentId(
    @Param('commentId') commentId: string,
    @Query() query: RepliesQueryModel,
  ) {
    const comments = await this.queryBus.execute(
      new RepliesByCommentGetCommand(commentId, query),
    );

    if (!comments.data) {
      return exceptionHandler(comments.code, comments.message, comments.field);
    }

    return comments.response;
  }

  @Put(':id')
  @SwaggerOptions(
    'Update a comment',
    true,
    false,
    204,
    'Updated',
    CommentViewModel,
    ` If input model has incorrect values`,
    ApiErrorMessages,
    true,
    true,
    true,
    false,
  )
  @UseGuards(DeviceAuthSessionGuard)
  @UseGuards(JwtBearerGuard)
  async update(
    @UserIdFromGuard() userId: string,
    @Param('id') id: string,
    @Body() commentUpdateModel: CommentUpdateModel,
  ) {
    const result = await this.commandBus.execute(
      new UpdateCommentCommand(id, commentUpdateModel, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }
    return result.res;
  }

  @Delete(':id')
  @SwaggerOptions(
    'Delete comment',
    true,
    false,
    204,
    'No Content',
    false,
    false,
    false,
    true,
    true,
    true,
    false,
  )
  @HttpCode(204)
  @UseGuards(DeviceAuthSessionGuard)
  @UseGuards(JwtBearerGuard)
  async delete(@UserIdFromGuard() userId: string, @Param('id') id: string) {
    const result = await this.commandBus.execute(
      new DeleteCommentCommand(id, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }
    return true;
  }
}
