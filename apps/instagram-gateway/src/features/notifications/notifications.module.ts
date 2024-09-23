import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { CommandBus } from '@nestjs/cqrs';

import { SocketGatewayService } from '../socket/socket.gateway.service';
import { UsersQueryRepository } from '../users/infrastructure/users.query.repo';
import { UserDevicesQueryRepository } from '../users/infrastructure/devices/user.devices.query.repo';
import { UsersModule } from '../users/users.module';
import { SubscriptionsService } from '../subscriptions/api/subscriptions.service';
import { SubscriptionsQueryRepository } from '../subscriptions/infrastructure/subscriptions.query.repo';
import { UsersRepository } from '../users/infrastructure/users.repo';

import { SendRegistrationMailUseCase } from './api/application/use-cases/send-registration-mail.use-case';
import { SendPasswordRecoveryUseCase } from './api/application/use-cases/send-pass-recovery-mail.use-case';
import { SendSuccessSubscriptionUseCase } from './api/application/use-cases/send-success-subscription-message.use-case';
import { SendSuccessRegistrationUseCase } from './api/application/use-cases/send-success-registration-message.use-case';
import { SendSuccessAutoRenewalSubscriptionUseCase } from './api/application/use-cases/send-success-auto-renewal-message.use-case';
import { SendMessageAboutEndSubscriptionUseCase } from './api/application/use-cases/send-message-about-end-subscription.use-case';
import { NotificationsRepository } from './infrastructure/notifications.repo';
import { NotificationsService } from './api/application/notifications.service';
import { NotificationsQueryRepository } from './infrastructure/notifications.query.repo';
import { NotificationsController } from './api/application/notifications.controller';
import { SendNotificationsService } from './api/application/send.notifications.service';

const useCases = [
  SendRegistrationMailUseCase,
  SendPasswordRecoveryUseCase,
  SendSuccessSubscriptionUseCase,
  SendSuccessRegistrationUseCase,
  SendSuccessAutoRenewalSubscriptionUseCase,
  SendMessageAboutEndSubscriptionUseCase,
];
const repositories = [
  NotificationsRepository,
  NotificationsQueryRepository,
  UsersRepository,
  UsersQueryRepository,
  UserDevicesQueryRepository,
  SubscriptionsQueryRepository,
];
const services = [
  PrismaClient,
  SocketGatewayService,
  NotificationsService,
  JwtService,
  SendNotificationsService,
  SubscriptionsService,
  CommandBus,
];

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          port: 465,
          host: 'smtp.gmail.com',
          auth: {
            user: configService.get<string>('EMAIL'),
            pass: configService.get<string>('EMAIL_PASS'),
          },
          secure: true,
        },
        defaults: {
          from: `"Warriors" <${configService.get<string>('EMAIL')}>`,
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [...useCases, ...repositories, ...services],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
