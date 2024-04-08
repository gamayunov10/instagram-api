import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UsersRepository } from './infrastructure/users.repo';
import { UserDevicesQueryRepository } from './infrastructure/user.devices.query.repo';

const services = [PrismaClient];
const repositories = [UsersRepository, UserDevicesQueryRepository];

@Module({
  controllers: [UserController],
  providers: [UserService, ...repositories, ...services],
})
export class UserModule {}
