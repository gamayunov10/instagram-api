import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as process from 'process';

import { MongooseConfigService } from './database/mongoose/mongoose.config.service';
import { FilesModule } from './features/files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'DEVELOPMENT'
          ? '.env.development'
          : '.env.test',
    }),
    MongooseModule.forRootAsync({ useClass: MongooseConfigService }),
    FilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
