import { Module } from '@nestjs/common';
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
import { fileServiceConfig } from './base/application/config/file-service.congig';
import { CleanupService } from './base/application/сleanup.service';

const services = [
  AppService,
  PrismaClient,
  PrismaService,
  FileServiceAdapter,
  CleanupService,
];
const modules = [PostModule, UserModule, AuthModule, MailModule];
const controllers = [AppController, TestingController];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClientsModule.registerAsync([fileServiceConfig()]),
    ...modules,
    ScheduleModule.forRoot(),
  ],
  controllers: [...controllers],
  providers: [...services],
})
export class AppModule {}
