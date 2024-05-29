import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';

import { SwaggerOptions } from '../../../infrastructure/decorators/swagger.decorator';
import { ApiErrorMessages } from '../../../base/schemas/api-error-messages.schema';
import { DeviceAuthSessionGuard } from '../../../infrastructure/guards/devie-auth-session.guard';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import { CreateSubscriptionInputModel } from '../models/input/create-subscription.input.model';
import { PaymentSessionUrlViewModel } from '../models/output/payment-session-url.view.model';

@Controller('subscriptions')
@ApiTags('Subscriptions')
export class SubscriptionsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @SwaggerOptions(
    'Create payment-subscriptions',
    true,
    false,
    201,
    'The payment-subscriptions has been successfully created with status pending, need to pay',
    PaymentSessionUrlViewModel,
    true,
    ApiErrorMessages,
    true,
    false,
    false,
    false,
  )
  @UseGuards(DeviceAuthSessionGuard)
  @UseGuards(JwtBearerGuard)
  @HttpCode(201)
  async createSubscription(
    @UserIdFromGuard() userId: string,
    @Body() createSubscriptionInputModel: CreateSubscriptionInputModel,
  ): Promise<PaymentSessionUrlViewModel> {
    // const result = await this.commandBus.execute(
    //   new CreatePostCommand(postInputModel, userId),
    // );
    //
    // if (result.code !== ResultCode.Success) {
    //   return exceptionHandler(result.code, result.message, result.field);
    // }
    //
    // const postView = await this.queryBus.execute(
    //   new PostViewCommand(result.res, userId),
    // );

    return { url: 'dd' };
  }
}
