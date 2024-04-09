import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { IncomingMessage } from 'http';
import { User } from '@prisma/client';

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
import { UserPasswdRecoveryInputModel } from '../models/input/user-passwd-recovery.input.model';
import { UserLoginInputModel } from '../models/input/user-login.input.model';
import { AccessTokenView } from '../models/output/access-token-view.model';
import { RecaptchaGuard } from '../../../infrastructure/guards/recaptcha.guard';
import { GoogleOAuth2Guard } from '../../../infrastructure/guards/google-oauth2.guard';
import { GitHubOAuth2Guard } from '../../../infrastructure/guards/github-oauth2.guard';
import { CheckRefreshToken } from '../../../infrastructure/guards/check-refresh-token.guard';
import { CookiesDecorator } from '../../../infrastructure/decorators/cookies.decorator';

import { RegistrationCommand } from './application/use-cases/registration.use-case';
import { RegistrationConfirmationCommand } from './application/use-cases/registration-confirmation.use-case';
import { PasswordRecoveryCommand } from './application/use-cases/password-recovery.use-case';
import { LoginCommand } from './application/use-cases/login.use.case';
import { AuthService } from './application/auth.service';
import { CreateOAuthTokensCommand } from './application/use-cases/tokens/create-oauth-token.use-case';
import { LogoutDeviceCommand } from './application/use-cases/devices/logout-device.use-case';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private commandBus: CommandBus,
    private authService: AuthService,
  ) {}

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
    'reCAPTCHA',
    `If User with this email doesn't exist`,
    false,
  )
  @UseGuards(RecaptchaGuard)
  @HttpCode(204)
  async passwordRecovery(
    @Body() userPasswdRecoveryInputModel: UserPasswdRecoveryInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new PasswordRecoveryCommand(userPasswdRecoveryInputModel),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Get('google/login')
  @SwaggerOptions(
    'Try login user to the system by Google (OAuth2)',
    false,
    false,
    200,
    'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds).',
    AccessTokenView,
    false,
    false,
    false,
    false,
    false,
    false,
  )
  @UseGuards(GoogleOAuth2Guard)
  @HttpCode(200)
  async googleLogin() {
    return { msg: 'Google Auth' };
  }

  @Get('google/redirect')
  @ApiExcludeEndpoint()
  @UseGuards(GoogleOAuth2Guard)
  async googleRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const user: Partial<User> = req.user;

    const result = await this.commandBus.execute(
      new CreateOAuthTokensCommand(user),
    );

    (res as Response)
      .cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: result.accessToken });
  }

  @Get('github/login')
  @SwaggerOptions(
    'Try login user to the system by Github (OAuth2)',
    false,
    false,
    200,
    'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds).',
    AccessTokenView,
    'If the provider has not provided all the necessary data',
    ApiErrorMessages,
    false,
    false,
    false,
    false,
  )
  @UseGuards(GitHubOAuth2Guard)
  @HttpCode(200)
  async githubLogin() {
    return { msg: 'GitHub Auth' };
  }

  @Get('github/redirect')
  @ApiExcludeEndpoint()
  @UseGuards(GitHubOAuth2Guard)
  async githubRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const user: Partial<User> = req.user;

    const result = await this.commandBus.execute(
      new CreateOAuthTokensCommand(user),
    );

    (res as Response)
      .cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .json({ accessToken: result.accessToken });
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
  @UseGuards(CheckRefreshToken)
  @Post('logout')
  @SwaggerOptions(
    'Logout of an authorized user',
    false,
    false,
    204,
    'No content',
    false,
    '',
    false,
    'If the JWT refreshToken inside cookie is missing, expired or incorrect',
    false,
    false,
    false,
  )
  @HttpCode(200)
  async logout(
    @Ip() ip: string,
    @Headers() headers: IncomingMessage,
    @CookiesDecorator('refreshToken') refreshToken: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.commandBus.execute(new LogoutDeviceCommand(refreshToken));
    res.clearCookie('refreshToken');
    res.status(204);
  }
}
