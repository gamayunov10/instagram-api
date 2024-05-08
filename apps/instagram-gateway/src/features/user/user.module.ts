import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';

import { FileServiceAdapter } from '../../base/application/adapters/file-service.adapter';
import { fileServiceConfig } from '../../base/application/config/file-service.congig';

import { UserService } from './api/application/user.service';
import { UserController } from './api/user.controller';
import { UsersRepository } from './infrastructure/users.repo';
import { FillOutProfileUseCase } from './api/application/use-cases/fill-out-profile.use-case';
import { UsersQueryRepository } from './infrastructure/users.query.repo';
import { GetProfileInfoUseCase } from './api/application/use-cases/get-profile-info-use.case';
import { UploadUserPhotoUseCase } from './api/application/use-cases/upload-user-photo.use-case';
import { DeleteUserPhotoUseCase } from './api/application/use-cases/delete-user-photo.use-case';
import { UserDevicesQueryRepository } from './infrastructure/devices/user.devices.query.repo';

const services = [PrismaClient, FileServiceAdapter, JwtService];
const useCases = [
  FillOutProfileUseCase,
  GetProfileInfoUseCase,
  UploadUserPhotoUseCase,
  DeleteUserPhotoUseCase,
];
const repositories = [UsersRepository];
const queryRepositories = [UsersQueryRepository, UserDevicesQueryRepository];

@Module({
  imports: [CqrsModule, ClientsModule.registerAsync([fileServiceConfig()])],
  controllers: [UserController],
  providers: [
    UserService,
    ...repositories,
    ...queryRepositories,
    ...services,
    ...useCases,
  ],
})
export class UserModule {}
