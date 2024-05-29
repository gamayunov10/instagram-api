import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const configService = new ConfigService();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: configService.get<string>('PAY_SERVICE_HOST') || '0.0.0.0',
        port: Number(configService.get<string>('PAY__SERVICE_PORT')) || 3424,
      },
    },
  );

  await app.listen();
}
bootstrap();