import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { ClientsModule } from '@nestjs/microservices';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { PostModule } from './features/post/post.module';
import { UserModule } from './features/user/user.module';
import { PrismaService } from './database/prisma/prisma.service';
import { AuthModule } from './features/auth/auth.module';
import { MailModule } from './features/mail/mail.module';
import { TestingController } from './testing/testing.controller';
import { AppService } from './app.service';
import { FileServiceAdapter } from './base/application/adapters/file-service.adapter';
import { fileServiceConfig } from './base/application/config/file-service.config';
import { SubscriptionsModule } from './features/subscriptions/subscriptions.module';
import { paymentsServiceConfig } from './base/application/config/payments-service.config';
import { PaymentsServiceAdapter } from './base/application/adapters/payments-service.adapter';
import { RawBodyMiddleware } from './infrastructure/middlewares/raw-body.middleware';
import { JsonBodyMiddleware } from './infrastructure/middlewares/json-body.middleware';

const services = [
  AppService,
  PrismaClient,
  PrismaService,
  FileServiceAdapter,
  PaymentsServiceAdapter,
];
const modules = [
  PostModule,
  UserModule,
  AuthModule,
  MailModule,
  SubscriptionsModule,
];
const controllers = [AppController, TestingController];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.registerAsync([fileServiceConfig(), paymentsServiceConfig()]),
    ...modules,
    ScheduleModule.forRoot(),
  ],
  controllers: [...controllers],
  providers: [...services],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({
        path: 'subscriptions/stripe-hook',
        method: RequestMethod.POST,
      })
      .apply(JsonBodyMiddleware)
      .forRoutes('*');
  }
}
