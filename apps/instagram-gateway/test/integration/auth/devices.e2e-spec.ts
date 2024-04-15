import { INestApplication } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import { randomUUID } from 'crypto';

import { TestManager } from '../../base/managers/test.manager';
import {
  createUserInput,
  createUserInput2,
  createUserInput3,
  createUserInput4,
  createUserInput5,
  createUserInput6,
  createUserInput7,
} from '../../base/constants/tests-strings';
import { expectErrorWithPath } from '../../base/utils/expectErrorWithPath';
import { expectDevice } from '../../base/utils/devices/expectDevices';
import { expectErrorMessages } from '../../base/utils/expectErrorMessages';
import { beforeAllConfig } from '../../base/settings/before-all-config';

export const devices_url = '/api/v1/auth/devices';

describe('AuthController: /devices', () => {
  let app: INestApplication;
  let agent: TestAgent<any>;
  let testManager: TestManager;

  beforeAll(async () => {
    const config = await beforeAllConfig();
    app = config.app;
    agent = config.agent;
    testManager = config.testManager;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('negative', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should not Return all devices with active sessions for current user
     if the JWT refreshToken inside cookie is missing, expired or incorrect`, async () => {
      await testManager.createUser(createUserInput);

      const response = await agent
        .get(devices_url)
        // .set('Cookie', refreshToken) // missing
        .expect(401);

      expectErrorWithPath(response, 401, devices_url);
    });

    it(`should not Terminate all other sessions (exclude current) 
    if the JWT refreshToken inside cookie is missing, expired or incorrect`, async () => {
      await testManager.createUser(createUserInput6);

      const response = await agent
        .delete(devices_url)
        // .set('Cookie', refreshToken) // missing
        .expect(401);

      expectErrorWithPath(response, 401, devices_url);
    });

    it(`should not Terminate all other sessions (exclude current)  
        if the JWT refreshToken inside cookie is missing, expired or incorrect`, async () => {
      await testManager.createUser(createUserInput7);

      const response = await agent
        .delete(devices_url)
        .set('Cookie', 'invalidRefreshToken') // incorrect
        .expect(401);

      expectErrorWithPath(response, 401, devices_url);
    });

    it(`should not Terminate specified device session 
        if the JWT refreshToken inside cookie is missing, expired or incorrect`, async () => {
      await testManager.createUser(createUserInput2);

      const deviceId = await testManager.getDeviceIdByEmail(
        createUserInput2.email,
      );

      const response = await agent
        .delete(`${devices_url}/${deviceId}`)
        // .set('Cookie', refreshToken) // missing
        .expect(401);

      expectErrorWithPath(response, 401, `${devices_url}/${deviceId}`);
    });

    it(`should not Terminate specified device session 
        If try to delete the deviceId of other user`, async () => {
      const user1 = await testManager.createUser(createUserInput3);

      await testManager.createUser(createUserInput4);

      const otherUserDeviceId = await testManager.getDeviceIdByEmail(
        createUserInput4.email,
      );

      const response = await agent
        .delete(`${devices_url}/${otherUserDeviceId}`)
        .set('Cookie', user1.refreshToken)
        .expect(403);

      expectErrorWithPath(response, 403, `${devices_url}/${otherUserDeviceId}`);
    });

    it(`should not Terminate specified device session 
        If try to delete the deviceId that does not exist`, async () => {
      const user = await testManager.createUser(createUserInput5);
      const deviceId = randomUUID();

      const response = await agent
        .delete(`${devices_url}/${deviceId}`)
        .set('Cookie', user.refreshToken)
        .expect(404);

      expectErrorMessages(response, 'deviceId');
    }, 20000);
  });

  describe('positive', () => {
    it(`should clear database`, async () => {
      await agent.delete('/api/v1/testing/all-data');
    });

    it(`should Return all devices with active sessions for current user`, async () => {
      const user = await testManager.createUser(createUserInput);

      const deviceId = await testManager.getDeviceIdByEmail(
        createUserInput.email,
      );

      const response = await agent
        .get(devices_url)
        .set('Cookie', user.refreshToken)
        .expect(200);

      expectDevice(response, deviceId);
    });

    it(`should Terminate specified device session`, async () => {
      const user = await testManager.createUser(createUserInput2);

      const deviceId = await testManager.getDeviceIdByEmail(
        createUserInput2.email,
      );

      await agent
        .delete(`${devices_url}/${deviceId}`)
        .set('Cookie', user.refreshToken)
        .expect(204);

      await agent
        .delete(`${devices_url}/${deviceId}`)
        .set('Cookie', user.refreshToken)
        .expect(401);
    });
  });
});
