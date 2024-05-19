import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';

import { FileServiceAdapter } from '../../base/application/adapters/file-service.adapter';
import { UsersRepository } from '../user/infrastructure/users.repo';
import { UsersQueryRepository } from '../user/infrastructure/users.query.repo';
import { fileServiceConfig } from '../../base/application/config/file-service.congig';

import { PostService } from './api/application/post.service';
import { PostController } from './api/post.controller';
import { UploadPostPhotoUseCase } from './api/application/use-cases/commandBus/upload-post-photo.use-case';
import { CreatePostUseCase } from './api/application/use-cases/commandBus/create-post.use-case';
import { PostsRepository } from './infrastructure/posts.repo';
import { PostViewUseCase } from './api/application/use-cases/queryBus/public-post-view.use-case';
import { PostsQueryRepository } from './infrastructure/posts.query.repo';
import { UpdatePostUseCase } from './api/application/use-cases/commandBus/update-post.use-case';
import { PostsGetUseCase } from './api/application/use-cases/queryBus/posts-get-use.case';
import { PublicPostsGetUseCase } from './api/application/use-cases/queryBus/public-posts-get-use.case';
import { PublicPostsController } from './api/public.posts.controller';
import { PublicPostGetUseCase } from './api/application/use-cases/queryBus/public-post-get-use.case';

const useCases = [
  UploadPostPhotoUseCase,
  CreatePostUseCase,
  PostViewUseCase,
  UpdatePostUseCase,
  PostsGetUseCase,
  PublicPostsGetUseCase,
  PublicPostGetUseCase,
];
const services = [PrismaClient];
const adapters = [FileServiceAdapter];
const repositories = [PostsRepository, UsersRepository];
const queryRepositories = [UsersQueryRepository, PostsQueryRepository];

@Module({
  imports: [CqrsModule, ClientsModule.registerAsync([fileServiceConfig()])],
  controllers: [PostController, PublicPostsController],
  providers: [
    PostService,
    ...useCases,
    ...services,
    ...adapters,
    ...repositories,
    ...queryRepositories,
  ],
})
export class PostModule {}
