import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule } from '@nestjs/microservices';

import { UsersService } from '../users/api/application/users.service';
import { fileServiceConfig } from '../../base/application/config/file-service.config';
import { UsersRepository } from '../users/infrastructure/users.repo';
import { UsersQueryRepository } from '../users/infrastructure/users.query.repo';
import { UserDevicesQueryRepository } from '../users/infrastructure/devices/user.devices.query.repo';
import { PostsQueryRepository } from '../posts/infrastructure/posts.query.repo';

import { CommentController } from './api/comments.controller';
import { CommentsRepository } from './infrastructure/comments.repo';
import { CommentsQueryRepo } from './infrastructure/comments.query.repo';
import { CommentService } from './api/application/comments.service';
import { CreateCommentUseCase } from './api/application/use-cases/commandBus/create-comment.use-case';
import { UpdateCommentUseCase } from './api/application/use-cases/commandBus/update-comment.use-case';
import { DeleteCommentUseCase } from './api/application/use-cases/commandBus/delete-comment.use-case';
import { CommentsByPostGetUseCase } from './api/application/use-cases/queryBus/get-comments-by-post.use-case';
import { RepliesByCommentGetUseCase } from './api/application/use-cases/queryBus/get-replies-by-comment.use-case';

const services = [PrismaClient, JwtService, UsersService];

const useCases = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  CommentsByPostGetUseCase,
  RepliesByCommentGetUseCase,
];

const repositories = [
  CommentsRepository,
  UsersRepository,
  PostsQueryRepository,
];

const queryRepositories = [
  CommentsQueryRepo,
  UsersQueryRepository,
  UserDevicesQueryRepository,
];

@Module({
  imports: [CqrsModule, ClientsModule.registerAsync([fileServiceConfig()])],
  controllers: [CommentController],
  providers: [
    CommentService,
    ...services,
    ...useCases,
    ...repositories,
    ...queryRepositories,
  ],
})
export class CommentModule {}
