import { Controller, Delete, HttpCode, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

import { SwaggerOptions } from '../infrastructure/decorators/swagger.decorator';
import { exceptionHandler } from '../infrastructure/exception-filters/exception-handler';
import { ResultCode } from '../base/enums/result-code.enum';
import {
  environmentField,
  productionDbGuard,
} from '../base/constants/constants';
import { NodeEnv } from '../base/enums/node-env.enum';

@Controller('testing')
@ApiTags('Testing')
export class TestingController {
  private readonly logger = new Logger(TestingController.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaClient: PrismaClient,
  ) {}

  @Delete('all-data')
  @SwaggerOptions(
    'Clear database: delete all data from all tables/collections',
    false,
    false,
    204,
    'All data is deleted',
    false,
    false,
    false,
    false,
    true,
    false,
    false,
  )
  @HttpCode(204)
  async clearDatabase(): Promise<void> {
    try {
      if (
        this.configService.get('ENV') !== NodeEnv.PRODUCTION ||
        this.configService.get('ENV') !== NodeEnv.STAGING
      ) {
        await this.prismaClient.$transaction([
          this.prismaClient.confirmationCode.deleteMany({}),
          this.prismaClient.userProviderInfo.deleteMany({}),
          this.prismaClient.deviceAuthSession.deleteMany({}),
          this.prismaClient.passwordRecoveryCode.deleteMany({}),
          this.prismaClient.post.deleteMany({}),
          this.prismaClient.user.deleteMany({}),
        ]);

        this.logger.log('All data has been deleted.');
      } else {
        this.logger.error(productionDbGuard);

        return exceptionHandler(
          ResultCode.Forbidden,
          productionDbGuard,
          environmentField,
        );
      }
    } catch (e) {
      this.logger.error(`Error deleting data: ${e.message}`);
    }
  }
}
