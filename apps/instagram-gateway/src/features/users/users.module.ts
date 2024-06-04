import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';

import { FileServiceAdapter } from '../../base/application/adapters/file-service.adapter';
import { fileServiceConfig } from '../../base/application/config/file-service.config';
import { PostsQueryRepository } from '../posts/infrastructure/posts.query.repo';

import { UsersController } from './api/users.controller';
import { UsersRepository } from './infrastructure/users.repo';
import { FillOutProfileUseCase } from './api/application/use-cases/fill-out-profile.use-case';
import { UsersQueryRepository } from './infrastructure/users.query.repo';
import { GetProfileInfoUseCase } from './api/application/use-cases/get-profile-info-use.case';
import { DeleteUserPhotoUseCase } from './api/application/use-cases/delete-user-photo.use-case';
import { UploadUserPhotoUseCase } from './api/application/use-cases/upload-user-photo.use-case';
import { UserDevicesQueryRepository } from './infrastructure/devices/user.devices.query.repo';
import { ViewUserPublicInfoUseCase } from './api/application/use-cases/view-user-public-info.use-case';
import { PublicUsersController } from './api/public.users.controller';

const services = [PrismaClient, FileServiceAdapter, JwtService];
const useCases = [
  FillOutProfileUseCase,
  GetProfileInfoUseCase,
  DeleteUserPhotoUseCase,
  UploadUserPhotoUseCase,
  ViewUserPublicInfoUseCase,
];
const repositories = [UsersRepository];
const adapters = [FileServiceAdapter];

const queryRepositories = [
  UsersQueryRepository,
  UserDevicesQueryRepository,
  PostsQueryRepository,
];

@Module({
  imports: [CqrsModule, ClientsModule.registerAsync([fileServiceConfig()])],
  controllers: [UsersController, PublicUsersController],
  providers: [
    ...repositories,
    ...queryRepositories,
    ...services,
    ...useCases,
    ...adapters,
  ],
})
export class UsersModule {}
