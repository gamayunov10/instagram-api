import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AppController } from './app.controller';
import { PostModule } from './features/post/post.module';
import { UserModule } from './features/user/user.module';
import { PrismaService } from './database/prisma/prisma.service';
import { AuthModule } from './features/auth/auth.module';
import { MailModule } from './features/mail/mail.module';
import { TestingController } from './testing/testing.controller';
import { AppService } from './app.service';
import { appSettings } from './settings/app.settings';

const services = [AppService, PrismaClient, PrismaService];
const modules = [PostModule, UserModule, AuthModule, MailModule];
const controllers = [AppController, TestingController];

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'FILES_SERVICE',
        transport: Transport.TCP,
        options: {
          host:
            appSettings.api.FILE_SERVICE_HOST || 'instagram-api-files-service',
          port: Number(appSettings.api.FILE_SERVICE_PORT) || 3339,
        },
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...modules,
  ],
  controllers: [...controllers],
  providers: [...services],
})
export class AppModule {}
