import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import * as Buffer from 'node:buffer';

import { DeviceAuthSessionGuard } from '../../../infrastructure/guards/devie-auth-session.guard';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import { CreateSubscriptionInputModel } from '../models/input/create-subscription.input.model';
import { PaymentSessionUrlViewModel } from '../models/output/payment-session-url.view.model';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception-handler';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger.decorator';
import { ApiErrorMessages } from '../../../base/schemas/api-error-messages.schema';

import { BuySubscriptionsCommand } from './application/use-cases/buy-subscriptions.use-case';
import { StripeHookCommand } from './application/use-cases/stripe-hook.use-case';

@Controller('subscriptions')
@ApiTags('Subscriptions')
export class SubscriptionsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('create-payment')
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
  ): Promise<PaymentSessionUrlViewModel | void> {
    const result = await this.commandBus.execute(
      new BuySubscriptionsCommand(createSubscriptionInputModel, userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result.response;
  }

  @Post('stripe-hook')
  async stripeHook(
    @Body() data: Buffer,
    @Req() request: Request,
  ): Promise<void> {
    const signature = request.headers['stripe-signature'];

    const result = await this.commandBus.execute(
      new StripeHookCommand(signature, data),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }
  }
}
