import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../../base/enums/node-env.enum';

@Injectable()
export class SubscribersQueryRepository {
  private readonly logger = new Logger(SubscribersQueryRepository.name);

  constructor(
    private prismaClient: PrismaClient,
    private readonly configService: ConfigService,
  ) {}
  async findSubscriberById(userId: string) {
    try {
      return await this.prismaClient.subscriber.findFirst({
        where: { userId },
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return false;
    } finally {
      await this.prismaClient.$disconnect();
    }
  }
}
