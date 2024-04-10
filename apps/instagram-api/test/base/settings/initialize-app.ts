import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';

import { appSettings } from '../../../src/settings/app.settings';
import { AppModule } from '../../../src/app.module';
import { RecaptchaGuard } from '../../../src/infrastructure/guards/recaptcha.guard';
import { ReCaptchaGuardMock } from '../mock/ReCaptchaGuardMock';

import { prismaClientSingleton } from './prisma-client-singleton';

export const initializeApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(RecaptchaGuard)
    .useValue(new ReCaptchaGuardMock())
    .compile();

  const app = moduleFixture.createNestApplication();
  const prisma = prismaClientSingleton.getPrisma();

  appSettings.applySettings(app);

  await app.init();
  const agent = supertest.agent(app.getHttpServer());

  return { app, agent, prisma };
};
