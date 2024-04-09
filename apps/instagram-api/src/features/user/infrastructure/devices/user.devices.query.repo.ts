import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { DeviceAuthSession } from '@prisma/client';

@Injectable()
export class UserDevicesQueryRepository {
  private readonly logger = new Logger(UserDevicesQueryRepository.name);

  constructor(
    private readonly configService: ConfigService,
    private prismaClient: PrismaClient,
  ) {}

  async findUserByDeviceId(
    userId: string,
    deviceId: string,
  ): Promise<DeviceAuthSession> {
    return this.prismaClient.deviceAuthSession.findFirst({
      where: { userId, deviceId },
    });
  }

  async findDeviceByDeviceId(deviceId: string): Promise<DeviceAuthSession> {
    return this.prismaClient.deviceAuthSession.findFirst({
      where: { deviceId },
    });
  }
}
