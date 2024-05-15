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
import { UploadPostPhotoUseCase } from './api/application/use-cases/upload-post-photo.use-case';
import { CreatePostUseCase } from './api/application/use-cases/create-post.use-case';
import { PostsRepository } from './infrastructure/posts.repo';
import { PostViewUseCase } from './api/application/use-cases/public-post-view.use-case';
import { PostsQueryRepository } from './infrastructure/posts.query.repo';
import { UpdatePostUseCase } from './api/application/use-cases/update-post.use-case';
import { PostsGetUseCase } from './api/application/use-cases/posts-get-use.case';
import { DeletePostUseCase } from './api/application/use-cases/delete-post.use-case';

const useCases = [
  UploadPostPhotoUseCase,
  CreatePostUseCase,
  PostViewUseCase,
  UpdatePostUseCase,
  PostsGetUseCase,
  DeletePostUseCase,
];
const services = [PrismaClient];
const adapters = [FileServiceAdapter];
const repositories = [PostsRepository, UsersRepository];
const queryRepositories = [UsersQueryRepository, PostsQueryRepository];

@Module({
  imports: [CqrsModule, ClientsModule.registerAsync([fileServiceConfig()])],
  controllers: [PostController],
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
