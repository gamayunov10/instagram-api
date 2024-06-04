import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';

import { UserDevicesQueryRepository } from '../users/infrastructure/devices/user.devices.query.repo';
import { UsersQueryRepository } from '../users/infrastructure/users.query.repo';
import { paymentsServiceConfig } from '../../base/application/config/payments-service.config';
import { PaymentsServiceAdapter } from '../../base/application/adapters/payments-service.adapter';
import { UsersRepository } from '../users/infrastructure/users.repo';

import { SubscriptionsService } from './api/subscriptions.service';
import { SubscriptionsQueryRepository } from './infrastructure/subscriptions.query.repo';
import { SubscriptionsRepository } from './infrastructure/subscriptions.repo';
import { SubscriptionsController } from './api/subscriptions.controller';
import { BuySubscriptionsUseCase } from './api/application/use-cases/buy-subscriptions.use-case';
import { StripeHookUseCase } from './api/application/use-cases/stripe-hook.use-case';
import { PaypalHookUseCase } from './api/application/use-cases/paypal-hook.use-case';

const adapters = [PaymentsServiceAdapter];
const services = [PrismaClient, SubscriptionsService, JwtService];
const useCases = [
  BuySubscriptionsUseCase,
  StripeHookUseCase,
  PaypalHookUseCase,
];
const repositories = [SubscriptionsRepository, UsersRepository];
const queryRepositories = [
  SubscriptionsQueryRepository,
  UserDevicesQueryRepository,
  UsersQueryRepository,
];

@Module({
  imports: [CqrsModule, ClientsModule.registerAsync([paymentsServiceConfig()])],
  controllers: [SubscriptionsController],
  providers: [
    ...repositories,
    ...queryRepositories,
    ...services,
    ...useCases,
    ...adapters,
  ],
})
export class SubscriptionsModule {}
