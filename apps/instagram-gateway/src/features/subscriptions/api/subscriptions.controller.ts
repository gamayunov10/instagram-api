import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import * as Buffer from 'node:buffer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

import { DeviceAuthSessionGuard } from '../../../infrastructure/guards/devie-auth-session.guard';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import { CreateSubscriptionInputModel } from '../models/input/create-subscription.input.model';
import { PaymentSessionUrlViewModel } from '../models/output/payment-session-url.view.model';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception-handler';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger.decorator';
import { ApiErrorMessages } from '../../../base/schemas/api-error-messages.schema';
import { PaypalHookQueryModel } from '../models/query/paypal-hook.query.model';
import {
  noneField,
  paymentTransactionFailed,
} from '../../../base/constants/constants';

import { BuySubscriptionsCommand } from './application/use-cases/buy-subscriptions.use-case';
import { StripeHookCommand } from './application/use-cases/stripe-hook.use-case';
import { PaypalHookCommand } from './application/use-cases/paypal-hook.use-case';

@Controller('subscriptions')
@ApiTags('Subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
  ) {}

  @Post('create-payment')
  @SwaggerOptions(
    'Create payment-subscriptions',
    true,
    false,
    202,
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
  @HttpCode(202)
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
  @ApiExcludeEndpoint()
  async stripeHook(
    @Body() data: Buffer,
    @Req() request: Request,
  ): Promise<void> {
    const signature = request.headers['stripe-signature'];

    const result = await this.commandBus.execute(
      new StripeHookCommand(signature, data),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, paymentTransactionFailed, noneField);
    }
  }

  @Get('paypal-hook')
  @ApiExcludeEndpoint()
  async paypalHook(
    @Query() query: PaypalHookQueryModel,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new PaypalHookCommand(query.token),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, paymentTransactionFailed, noneField);
    }

    res.redirect(this.configService.get<string>('PUBLIC_FRONT_URL'));
  }
}
