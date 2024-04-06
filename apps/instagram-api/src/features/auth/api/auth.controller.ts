import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Ip,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { IncomingMessage } from 'http';

import { UserAuthInputModel } from '../models/input/user-auth.input.model';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger.decorator';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception-handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import {
  confirmationCodeIsIncorrect,
  confirmCodeField,
} from '../../../base/constants/constants';
import { UserConfirmationCodeInputModel } from '../models/input/user-confirmation-code.input.model';
import { ApiErrorMessages } from '../../../base/schemas/api-error-messages.schema';
import { UserEmailInputModel } from '../models/input/user-email.input.model';
import { UserLoginInputModel } from '../models/input/user-login.input.model';
import { AccessTokenView } from '../models/output/access-token-view.model';

import { RegistrationCommand } from './application/use-cases/registration.use-case';
import { RegistrationConfirmationCommand } from './application/use-cases/registration-confirmation.use-case';
import { PasswordRecoveryCommand } from './application/use-cases/password-recovery.use-case';
import { LoginCommand } from './application/use-cases/login.use.case';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  @Post('registration')
  @SwaggerOptions(
    'Registration in the system',
    false,
    false,
    204,
    'Input data is accepted. Email with confirmation code will be send to passed email address',
    false,
    'If the inputModel has incorrect values (in particular if the user with the given email or password already exists)',
    ApiErrorMessages,
    false,
    false,
    false,
    false,
  )
  @HttpCode(204)
  async registerUser(
    @Body() userAuthInputModel: UserAuthInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new RegistrationCommand(userAuthInputModel),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        confirmationCodeIsIncorrect,
        confirmCodeField,
      );
    }

    return result;
  }

  @Post('registration-confirmation')
  @SwaggerOptions(
    'Confirm registration',
    false,
    false,
    204,
    'Email was verified. Account was activated',
    false,
    'If the confirmation code is incorrect, expired or already been applied',
    ApiErrorMessages,
    false,
    false,
    false,
    false,
  )
  @HttpCode(204)
  async confirmUser(
    @Body() userConfirmationCodeInputModel: UserConfirmationCodeInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new RegistrationConfirmationCommand(userConfirmationCodeInputModel),
    );

    if (!result) {
      return exceptionHandler(
        ResultCode.BadRequest,
        confirmationCodeIsIncorrect,
        confirmCodeField,
      );
    }

    return result;
  }

  @Post('password-recovery')
  @SwaggerOptions(
    'Password recovery via Email confirmation. Email should be sent with RecoveryCode inside',
    false,
    false,
    204,
    'Success',
    false,
    true,
    ApiErrorMessages,
    false,
    false,
    `If User with this email doesn't exist`,
    false,
  )
  @HttpCode(204)
  async passwordRecovery(@Body() userEmailInputModel: UserEmailInputModel) {
    const result = await this.commandBus.execute(
      new PasswordRecoveryCommand(userEmailInputModel),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Post('login')
  @SwaggerOptions(
    'Try login user to the system',
    false,
    false,
    200,
    'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds).',
    AccessTokenView,
    'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired',
    false,
    'If the password or login is wrong',
    false,
    false,
    false,
  )
  @HttpCode(200)
  async login(
    @Ip() ip: string,
    @Body() userLoginInputModel: UserLoginInputModel,
    @Headers() headers: IncomingMessage,
    @Res() res: Response,
  ): Promise<void> {
    const userAgent = headers['user-agent'] || 'unknown';

    const result = await this.commandBus.execute(
      new LoginCommand(userLoginInputModel, userAgent, ip),
    );

    (res as Response)
      .cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: result.accessToken });
  }
}
