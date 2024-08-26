import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';

import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception-handler';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger.decorator';
import { ApiErrorMessages } from '../../../base/schemas/api-error-messages.schema';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { PostInputModel } from '../models/input/post.input.model';
import { PostImageInputModel } from '../models/input/post.image.input.model';
import { PostViewModel } from '../models/output/post.view.model';
import { PostImageViewModel } from '../models/output/post-images.view.model';
import { UpdatePostModel } from '../models/input/update-post.model';
import { PostQueryModel } from '../models/query/post.query.model';
import { invalidPostPhoto } from '../../../base/constants/constants';
import { DeviceAuthSessionGuard } from '../../../infrastructure/guards/devie-auth-session.guard';
import { PublicPostsSchema } from '../../../base/schemas/public.posts.schema';

import { UploadPostPhotoCommand } from './application/use-cases/commandBus/upload-post-photo.use-case';
import { CreatePostCommand } from './application/use-cases/commandBus/create-post.use-case';
import { UpdatePostCommand } from './application/use-cases/commandBus/update-post.use-case';
import { PostsGetCommand } from './application/use-cases/queryBus/posts-get-use.case';
import { DeletePostCommand } from './application/use-cases/delete-post.use-case';
import { PublicPostGetCommand } from './application/use-cases/queryBus/public-post-get-use.case';

@Controller('post')
@ApiTags('Post')
export class PostsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get(':userId')
  @SwaggerOptions(
    'View yours posts',
    false,
    false,
    201,
    '',
    PublicPostsSchema,
    ``,
    ApiErrorMessages,
    false,
    false,
    false,
    false,
  )
  @HttpCode(201)
  async getPosts(
    @Param('userId') userId: string,
    @Query() query: PostQueryModel,
  ): Promise<PostViewModel | void> {
    const post = await this.queryBus.execute(
      new PostsGetCommand(userId, query),
    );

    if (!post.data) {
      return exceptionHandler(post.code, post.message, post.field);
    }

    return post.response;
  }

  @Post('photo')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'User photo (JPEG, PNG) not exceeding 20 MB',
        },
      },
      required: ['file'],
    },
  })
  @SwaggerOptions(
    'Upload post photo',
    true,
    false,
    201,
    'Photo are saved',
    PostImageViewModel,
    'If photo has incorrect format or size exceeding 20 MB',
    ApiErrorMessages,
    true,
    false,
    false,
    false,
  )
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(DeviceAuthSessionGuard)
  @UseGuards(JwtBearerGuard)
  @HttpCode(201)
  async uploadImagePost(
    @UserIdFromGuard() userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 20000000,
            message: invalidPostPhoto,
          }),
          new FileTypeValidator({ fileType: 'image/jpeg|image/png' }),
        ],
        fileIsRequired: true,
        exceptionFactory: () => {
          throw new BadRequestException([
            { message: invalidPostPhoto, field: 'file' },
          ]);
        },
      }),
    )
    file: Express.Multer.File,
  ): Promise<PostImageViewModel | void> {
    const data: PostImageInputModel = {
      userId,
      originalname: file.originalname,
      buffer: file.buffer,
    };

    const result = await this.commandBus.execute(
      new UploadPostPhotoCommand(data),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return { imageId: result.res };
  }

  @Post()
  @SwaggerOptions(
    'Create post',
    true,
    false,
    201,
    'Created',
    PostViewModel,
    ` If input model has incorrect values, or array of images doesn't contain uuid`,
    ApiErrorMessages,
    true,
    false,
    false,
    false,
  )
  @UseGuards(DeviceAuthSessionGuard)
  @UseGuards(JwtBearerGuard)
  @HttpCode(201)
  async createPost(
    @UserIdFromGuard() userId: string,
    @Body() postInputModel: PostInputModel,
  ): Promise<PostViewModel | void> {
    const result = await this.commandBus.execute(
      new CreatePostCommand(postInputModel, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    const post = await this.queryBus.execute(
      new PublicPostGetCommand(result.res),
    );

    if (post.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return post.response;
  }

  @Put(':id')
  @SwaggerOptions(
    'Update post',
    true,
    false,
    204,
    'No Content',
    false,
    ` If input model has incorrect values`,
    ApiErrorMessages,
    true,
    true,
    true,
    false,
  )
  @UseGuards(DeviceAuthSessionGuard)
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async updatePost(
    @Param('id') postId: string,
    @UserIdFromGuard() userId: string,
    @Body() updatePostModel: UpdatePostModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new UpdatePostCommand(updatePostModel, userId, postId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }
  }

  @Delete(':id')
  @SwaggerOptions(
    'Delete post',
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
  @UseGuards(DeviceAuthSessionGuard)
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async deletePost(
    @Param('id') postId: string,
    @UserIdFromGuard() userId: string,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new DeletePostCommand(userId, postId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }
  }
}
