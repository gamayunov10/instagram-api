import { UserLoginInputModel } from './../models/input/user-login.input.model';
import { Body, Controller, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { UserAuthInputModel } from '../models/input/user-auth.input.model';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger.decorator';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception-handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import {
  confirmationCodeIsIncorrect,
  confirmCodeField,
  loginIsIncorrect,
} from '../../../base/constants/constants';
import { UserConfirmationCodeInputModel } from '../models/input/user-confirmation-code.input.model';
import { ApiErrorMessages } from '../../../base/schemas/api-error-messages.schema';
import { UserEmailInputModel } from '../models/input/user-email.input.model';

import { RegistrationCommand } from './application/use-cases/registration.use-case';
import { RegistrationConfirmationCommand } from './application/use-cases/registration-confirmation.use-case';
<<<<<<< HEAD
import { LoginInTheSystemCommand } from './application/use-cases/login-in-the-system.use-case';
=======
import { PasswordRecoveryCommand } from './application/use-cases/password-recovery.use-case';
>>>>>>> development

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) { }

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

<<<<<<< HEAD
  @Post('login')
  @SwaggerOptions(
    'Log in',
   false,
    false,
    200,
    'The user has successfully logged in',
    false,
    'If the inputModel has incorrect values',
    ApiErrorMessages,
    'If the password or login is wrong',
    false,
    false,
    false
  )
  @HttpCode(200)
  async loginUserToTheSystem(
    @Body() userLoginInputModel: UserLoginInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new LoginInTheSystemCommand(userLoginInputModel),
    )
    if (!result) {
      throw new HttpException(loginIsIncorrect, HttpStatus.UNAUTHORIZED)
    }
  }

=======
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
>>>>>>> development
}
