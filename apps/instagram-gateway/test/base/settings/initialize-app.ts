import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { appSettings } from '../../../src/settings/app.settings';
import { AppModule } from '../../../src/app.module';
import { ReCaptchaGuardMock } from '../mock/ReCaptchaGuardMock';
import { RecaptchaV2Guard } from '../../../src/infrastructure/guards/recaptcha-v2.guard';

import { prismaClientSingleton } from './prisma-client-singleton';

export const initializeApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      AppModule,
      ClientsModule.register([
        { name: 'FILE_SERVICE', transport: Transport.TCP },
      ]),
    ],
  })
    .overrideGuard(RecaptchaV2Guard)
    .useValue(new ReCaptchaGuardMock())
    .compile();

  const app = moduleFixture.createNestApplication();
  const prisma = prismaClientSingleton.getPrisma();

  appSettings.applySettings(app);

  app.connectMicroservice({
    transport: Transport.TCP,
  });

  const client = app.get('FILE_SERVICE');

  await app.init();
  await app.startAllMicroservices();
  await client.connect();
  const agent = supertest.agent(app.getHttpServer());

  return { app, agent, prisma };
};
