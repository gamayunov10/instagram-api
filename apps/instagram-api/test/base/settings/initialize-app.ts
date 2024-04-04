import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';

import { appSettings } from '../../../src/settings/app.settings';
import { AppModule } from '../../../src/app.module';

export const initializeApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
    providers: [
      {
        provide: PrismaClient,
        useFactory: () => {
          const prisma = new PrismaClient({
            datasources: {
              db: {
                url: process.env.TEST_DATABASE_URL,
              },
            },
          });
          return prisma;
        },
      },
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const prisma = moduleFixture.get<PrismaClient>(PrismaClient);

  appSettings.applySettings(app);

  await app.init();
  const agent = supertest.agent(app.getHttpServer());

  return { app, agent, prisma };
};
