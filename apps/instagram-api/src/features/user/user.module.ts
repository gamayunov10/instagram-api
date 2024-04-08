import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UsersRepository } from './infrastructure/users.repo';
import { UsersQueryRepository } from './infrastructure/users.query.repo';

const services = [PrismaClient];
const repositories = [UsersRepository, UsersQueryRepository];
@Module({
  controllers: [UserController],
  providers: [UserService, ...repositories, ...services],
})
export class UserModule {}
