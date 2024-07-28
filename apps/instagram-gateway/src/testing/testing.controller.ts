import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Logger,
  Post,
} from '@nestjs/common';
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
import { ApiErrorMessages } from '../base/schemas/api-error-messages.schema';
import { SubscriptionTime } from '../../../../libs/common/base/ts/enums/subscription-time.enum';
import { PaymentIds } from '../../../../libs/common/base/ts/enums/payment-ids.enum';

import { DeleteUsersInputModel } from './models/input/delete-users.input.model';

@Controller('testing')
@ApiTags('Testing')
export class TestingController {
  private readonly logger = new Logger(TestingController.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaClient: PrismaClient,
    private readonly fileServiceAdapter: FileServiceAdapter,
  ) {}

  @Post('insert-products')
  @SwaggerOptions(
    'Insert products',
    false,
    false,
    204,
    'Success',
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  )
  @HttpCode(204)
  async insertProducts(): Promise<void> {
    try {
      await this.prismaClient.$transaction([
        this.prismaClient.subscriptions.create({
          data: {
            id: PaymentIds.DAY,
            availability: true,
            subscriptionTimeType: SubscriptionTime.DAY,
            price: 100,
          },
        }),
        this.prismaClient.subscriptions.create({
          data: {
            id: PaymentIds.WEEKLY,
            availability: true,
            subscriptionTimeType: SubscriptionTime.WEEKLY,
            price: 1000,
          },
        }),
        this.prismaClient.subscriptions.create({
          data: {
            id: PaymentIds.MONTHLY,
            availability: true,
            subscriptionTimeType: SubscriptionTime.MONTHLY,
            price: 3000,
          },
        }),
      ]);
    } catch (e) {
      this.logger.error(`${e.message}`);
    }
  }

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
          this.prismaClient.subscriptionOrder.deleteMany({}),
          this.prismaClient.subscriptionPaymentTransaction.deleteMany({}),
          this.prismaClient.subscriber.deleteMany({}),
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

        this.logger.log('All data has been deleted');
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

  @Delete('delete-users')
  @SwaggerOptions(
    'Delete testing users by email',
    false,
    false,
    204,
    'All users has been deleted',
    false,
    true,
    ApiErrorMessages,
    false,
    false,
    false,
    false,
  )
  @HttpCode(204)
  async deleteUsersByEmail(
    @Body() deleteUsersInputModel: DeleteUsersInputModel,
  ): Promise<void> {
    try {
      await this.prismaClient.$transaction(
        deleteUsersInputModel.emails.map((email: string) =>
          this.prismaClient.user.deleteMany({ where: { email } }),
        ),
      );

      this.logger.log('All users has been deleted.');
    } catch (e) {
      this.logger.error(`Error deleting users: ${e.message}`);
    }
  }
}
