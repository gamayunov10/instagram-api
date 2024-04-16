import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CqrsModule } from '@nestjs/cqrs';

import { UserService } from './api/application/user.service';
import { UserController } from './api/user.controller';
import { UsersRepository } from './infrastructure/users.repo';
import { FillOutProfileUseCase } from './api/application/use-cases/fill-out-profile.use-case';
import { UsersQueryRepository } from './infrastructure/users.query.repo';

const services = [PrismaClient];
const usecases = [FillOutProfileUseCase];
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
    ...usecases,
  ],
})
export class UserModule {}
