import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { appSettings } from './settings/app.settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appSettings.applySettings(app);

  await app.listen(3000);
}
bootstrap();
