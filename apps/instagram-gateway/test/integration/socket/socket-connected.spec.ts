import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import { Socket, io } from 'socket.io-client';

import { TestManager } from '../../base/managers/test.manager';
import { beforeAllConfig } from '../../base/settings/before-all-config';
import { prismaClientSingleton } from '../../base/settings/prisma-client-singleton';
import { UserCredentialsType } from '../../base/types/testing.type';

describe('SocketConnected', (): void => {
  let app: INestApplication;
  let agent: TestAgent<any>;
  let testManager: TestManager;
  let participantClient: Socket;
  let dataAddress: { address: string; port: number };
  let user: UserCredentialsType;

  beforeAll(async (): Promise<void> => {
    // Настройка приложения один раз перед всеми тестами
    const config = await beforeAllConfig();
    app = config.app;
    agent = config.agent;
    testManager = config.testManager;

    await agent.delete('/api/v1/testing/all-data');

    // Запуск сервера и получение адреса
    const server = app.getHttpServer();
    await new Promise<void>((resolve, reject) => {
      server.listen(() => {
        const addressInfo = server.address();
        if (typeof addressInfo === 'string') {
          reject(new Error('Invalid server address'));
        } else {
          dataAddress = {
            address: addressInfo.address,
            port: addressInfo.port,
          };
          resolve();
        }
      });
    });
  });

  afterAll(async () => {
    // Закрытие приложения и всех подключений после всех тестов
    await app.close();
    await prismaClientSingleton.disconnect();
    if (participantClient) {
      participantClient.disconnect();
    }
  });

  beforeEach(async (): Promise<void> => {
    // Подключение клиента перед каждым тестом
    const baseAddress = `http://${dataAddress.address}:${dataAddress.port}`;
    participantClient = await new Promise<Socket>((resolve, reject) => {
      const options = {
        auth: {
          accessToken: user?.accessToken,
        },
      };
      const client = io(baseAddress + 'participant', options);

      client.on('connect', () => {
        resolve(client);
      });

      client.on('connect_error', (err) => {
        reject(err);
      });
    });
  });

  afterEach(async () => {
    if (participantClient) {
      participantClient.disconnect();
    }
  });
});
