import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

import { AppController } from './app.controller';
import { PostModule } from './features/post/post.module';
import { UserModule } from './features/user/user.module';
import { PrismaService } from './database/prisma/prisma.service';
import { AuthModule } from './features/auth/auth.module';
import { MailModule } from './features/mail/mail.module';
import { TestingController } from './testing/testing.controller';
import { AppService } from './app.service';

const services = [AppService, PrismaClient, PrismaService];
const modules = [PostModule, UserModule, AuthModule, MailModule];
const controllers = [AppController, TestingController];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ...modules,
  ],
  controllers: [...controllers],
  providers: [...services],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header(
          'Access-Control-Allow-Methods',
          'GET,HEAD,PUT,PATCH,POST,DELETE',
        );
        res.header(
          'Access-Control-Allow-Headers',
          'Origin, X-Requested-With, Content-Type, Accept',
        );
        res.header('Access-Control-Allow-Credentials', 'false');
        if (req.method === 'OPTIONS') {
          res.status(200).end();
          return;
        }
        next();
      })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
