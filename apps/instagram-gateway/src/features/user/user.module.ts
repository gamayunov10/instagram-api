import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CqrsModule } from '@nestjs/cqrs';

import { UserService } from './api/application/user.service';
import { UserController } from './api/user.controller';
import { UsersRepository } from './infrastructure/users.repo';
import { FillOutProfileUseCase } from './api/application/use-cases/fill-out-profile.use-case';
import { UsersQueryRepository } from './infrastructure/users.query.repo';
import { GetProfileInfoUseCase } from './api/application/use-cases/get-profile-info-use.case';

const services = [PrismaClient];
const useCases = [FillOutProfileUseCase, GetProfileInfoUseCase];
const repositories = [UsersRepository];
const queryRepositories = [UsersQueryRepository];

@Module({
  imports: [CqrsModule],
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
