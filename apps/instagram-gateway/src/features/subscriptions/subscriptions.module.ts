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
import { NotificationsService } from '../notifications/api/application/notifications.service';
import { NotificationsRepository } from '../notifications/infrastructure/notifications.repo';
import { NotificationsQueryRepository } from '../notifications/infrastructure/notifications.query.repo';
import { SocketGatewayService } from '../socket/socket.gateway.service';

import { SubscriptionsService } from './api/subscriptions.service';
import { SubscriptionsQueryRepository } from './infrastructure/subscriptions.query.repo';
import { SubscriptionsRepository } from './infrastructure/subscriptions.repo';
import { SubscriptionsController } from './api/subscriptions.controller';
import { BuySubscriptionsUseCase } from './api/application/use-cases/buy-subscriptions.use-case';
import { StripeHookUseCase } from './api/application/use-cases/stripe-hook.use-case';
import { PaypalHookUseCase } from './api/application/use-cases/paypal-hook.use-case';
import { GetMyPaymentsUseCase } from './api/application/use-cases/get-my-payments-use.case';
import { SubscribersRepository } from './infrastructure/subscriber/subscribers.repo';
import { SubscribersQueryRepository } from './infrastructure/subscriber/subscriber.query.repo';
import { VerifyPaypalHookUseCase } from './api/application/use-cases/verify-paypal-signature.use-case';
import { PaypalEventHookUseCase } from './api/application/use-cases/paypal-event-hook.use-case';
import { GetCurrentSubscriptionUseCase } from './api/application/use-cases/get-current-subscription';
import { CheckSubscriptions } from './api/application/check-subscriptions';

const adapters = [PaymentsServiceAdapter];
const services = [
  PrismaClient,
  SubscriptionsService,
  JwtService,
  CheckSubscriptions,
  SocketGatewayService,
  NotificationsService,
];
const useCases = [
  BuySubscriptionsUseCase,
  StripeHookUseCase,
  PaypalHookUseCase,
  GetMyPaymentsUseCase,
  VerifyPaypalHookUseCase,
  PaypalEventHookUseCase,
  GetCurrentSubscriptionUseCase,
];
const repositories = [
  SubscriptionsRepository,
  UsersRepository,
  SubscribersRepository,
  NotificationsRepository,
  NotificationsQueryRepository,
];
const queryRepositories = [
  SubscriptionsQueryRepository,
  UserDevicesQueryRepository,
  UsersQueryRepository,
  SubscribersQueryRepository,
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
