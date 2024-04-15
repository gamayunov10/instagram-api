import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserDevicesQueryRepository {
  private readonly logger = new Logger(UserDevicesQueryRepository.name);

  constructor(
    private readonly configService: ConfigService,
    private prismaClient: PrismaClient,
  ) {}

  async findUserByDeviceId(userId: string, deviceId: string) {
    return this.prismaClient.deviceAuthSession.findFirst({
      where: { userId, deviceId },
    });
  }

  async findDeviceByDeviceId(deviceId: string) {
    return this.prismaClient.deviceAuthSession.findFirst({
      where: { deviceId },
    });
  }

  async findDeviceByUserId(userId: string) {
    return this.prismaClient.deviceAuthSession.findFirst({
      where: { userId },
    });
  }

  async findActiveDevices(userId: string) {
    return this.prismaClient.deviceAuthSession.findMany({
      where: { userId },
      select: { deviceId: true, title: true, lastActiveDate: true },
    });
  }
}
