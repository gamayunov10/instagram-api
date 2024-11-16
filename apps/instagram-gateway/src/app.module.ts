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
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataLoaderInterceptor } from 'nestjs-dataloader/dist';

import { AppController } from './app.controller';
import { PostsModule } from './features/posts/posts.module';
import { PrismaService } from './database/prisma/prisma.service';
import { AuthModule } from './features/auth/auth.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { TestingController } from './testing/testing.controller';
import { AppService } from './app.service';
import { FileServiceAdapter } from './base/application/adapters/file-service.adapter';
import { fileServiceConfig } from './base/application/config/file-service.config';
import { SubscriptionsModule } from './features/subscriptions/subscriptions.module';
import { paymentsServiceConfig } from './base/application/config/payments-service.config';
import { PaymentsServiceAdapter } from './base/application/adapters/payments-service.adapter';
import { RawBodyMiddleware } from './infrastructure/middlewares/raw-body.middleware';
import { JsonBodyMiddleware } from './infrastructure/middlewares/json-body.middleware';
import { UsersModule } from './features/users/users.module';
import { SocketGatewayModule } from './features/socket/socket.gateway.module';
import { AppResolver } from './app.resolver';
import { AuthResolver } from './resolvers/auth/auth.resolver';
import { UsersResolver } from './resolvers/users/users.resolver';
import { PostsResolver } from './resolvers/posts/posts.resolver';
import { FilesLoader } from './base/data-loaders/files-loader';
import { UserImagesLoader } from './base/data-loaders/user-images-loader';
import { PostImagesLoader } from './base/data-loaders/post-images-loader';
import { DateTimeScalar } from './base/custom-scalar- gql/date.time.scalar';
import { PaymentsResolver } from './resolvers/payments/payments.resolver';
import { UserLoader } from './base/data-loaders/user-loader';

const services = [
  AppService,
  PrismaClient,
  PrismaService,
  FileServiceAdapter,
  PaymentsServiceAdapter,
];
const modules = [
  PostsModule,
  UsersModule,
  AuthModule,
  NotificationsModule,
  SubscriptionsModule,
  SocketGatewayModule,
];
const controllers = [AppController, TestingController];

const resolvers = [
  AppResolver,
  AuthResolver,
  UsersResolver,
  PostsResolver,
  PaymentsResolver,
];

const scalars = [DateTimeScalar];
const loaders = [FilesLoader, UserImagesLoader, PostImagesLoader, UserLoader];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.registerAsync([fileServiceConfig(), paymentsServiceConfig()]),
    ...modules,
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      path: '/api/v1/graphql',
      playground: true,
    }),
  ],
  controllers: [...controllers],
  providers: [
    ...services,
    ...resolvers,
    ...loaders,
    ...scalars,
    {
      provide: APP_INTERCEPTOR,
      useClass: DataLoaderInterceptor,
    },
  ],
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
