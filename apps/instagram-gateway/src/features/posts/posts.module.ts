import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

import { FileServiceAdapter } from '../../base/application/adapters/file-service.adapter';
import { UsersRepository } from '../users/infrastructure/users.repo';
import { UsersQueryRepository } from '../users/infrastructure/users.query.repo';
import { fileServiceConfig } from '../../base/application/config/file-service.config';
import { UserDevicesQueryRepository } from '../users/infrastructure/devices/user.devices.query.repo';

import { PostsService } from './api/application/posts.service';
import { PostsController } from './api/posts.controller';
import { UploadPostPhotoUseCase } from './api/application/use-cases/commandBus/upload-post-photo.use-case';
import { CreatePostUseCase } from './api/application/use-cases/commandBus/create-post.use-case';
import { PostsRepository } from './infrastructure/posts.repo';
import { PostViewUseCase } from './api/application/use-cases/queryBus/public-post-view.use-case';
import { PostsQueryRepository } from './infrastructure/posts.query.repo';
import { UpdatePostUseCase } from './api/application/use-cases/commandBus/update-post.use-case';
import { PostsGetUseCase } from './api/application/use-cases/queryBus/posts-get-use.case';
import { PublicPostsGetUseCase } from './api/application/use-cases/queryBus/public-posts-get-use.case';
import { PublicPostsController } from './api/public.posts.controller';
import { DeletePostUseCase } from './api/application/use-cases/delete-post.use-case';
import { PublicPostGetUseCase } from './api/application/use-cases/queryBus/public-post-get-use.case';
import { PostsCleanupService } from './api/application/posts.cleanup.service';

const useCases = [
  UploadPostPhotoUseCase,
  CreatePostUseCase,
  PostViewUseCase,
  UpdatePostUseCase,
  PostsGetUseCase,
  DeletePostUseCase,
  PublicPostsGetUseCase,
  PublicPostGetUseCase,
];
const services = [PrismaClient, PostsCleanupService, JwtService];
const adapters = [FileServiceAdapter];
const repositories = [PostsRepository, UsersRepository];
const queryRepositories = [
  UsersQueryRepository,
  PostsQueryRepository,
  UserDevicesQueryRepository,
];

@Module({
  imports: [CqrsModule, ClientsModule.registerAsync([fileServiceConfig()])],
  controllers: [PostsController, PublicPostsController],
  exports: [PostsRepository, PostsQueryRepository],
  providers: [
    PostsService,
    ...useCases,
    ...services,
    ...adapters,
    ...repositories,
    ...queryRepositories,
  ],
})
export class PostsModule {}
