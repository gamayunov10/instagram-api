import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostModule } from './features/post/post.module';
import { UserModule } from './features/user/user.module';
import { PrismaService } from './database/prisma/prisma.service';

@Module({
  imports: [PostModule, UserModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
