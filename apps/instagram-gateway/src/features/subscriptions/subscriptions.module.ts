import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { UserDevicesQueryRepository } from '../user/infrastructure/devices/user.devices.query.repo';
import { UsersQueryRepository } from '../user/infrastructure/users.query.repo';

import { SubscriptionsService } from './api/subscriptions.service';
import { SubscriptionsQueryRepository } from './infrastructure/subscriptions.query.repo';
import { SubscriptionsRepository } from './infrastructure/subscriptions.repo';
import { SubscriptionsController } from './api/subscriptions.controller';

const services = [PrismaClient, SubscriptionsService, JwtService];
const useCases = [];
const repositories = [SubscriptionsRepository, UsersQueryRepository];
const queryRepositories = [
  SubscriptionsQueryRepository,
  UserDevicesQueryRepository,
];

@Module({
  imports: [CqrsModule],
  controllers: [SubscriptionsController],
  providers: [...repositories, ...queryRepositories, ...services, ...useCases],
})
export class SubscriptionsModule {}
