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
import { FileServiceAdapter } from '../base/application/adapters/file-service.adapter';

@Controller('testing')
@ApiTags('Testing')
export class TestingController {
  private readonly logger = new Logger(TestingController.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaClient: PrismaClient,
    private readonly fileServiceAdapter: FileServiceAdapter,
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
        this.configService.get('ENV') === NodeEnv.TESTING ||
        this.configService.get('ENV') === NodeEnv.DEVELOPMENT
      ) {
        await this.prismaClient.$transaction([
          this.prismaClient.confirmationCode.deleteMany({}),
          this.prismaClient.userProviderInfo.deleteMany({}),
          this.prismaClient.deviceAuthSession.deleteMany({}),
          this.prismaClient.postImage.deleteMany({}),
          this.prismaClient.passwordRecoveryCode.deleteMany({}),
          this.prismaClient.post.deleteMany({}),
          this.prismaClient.user.deleteMany({}),
        ]);

        const deleteFileResult = await this.fileServiceAdapter.deleteAllFiles();

        if (!deleteFileResult.data) {
          this.logger.log('Data has not been deleted');
        }

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

      return exceptionHandler(
        ResultCode.Forbidden,
        productionDbGuard,
        environmentField,
      );
    }
  }
}
