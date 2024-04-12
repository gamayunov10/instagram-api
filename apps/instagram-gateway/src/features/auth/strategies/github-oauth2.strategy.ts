import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';

import { AuthService } from '../api/application/auth.service';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception-handler';
import { ResultCode } from '../../../base/enums/result-code.enum';
import {
  emailField,
  githubEmailNotAvailable,
} from '../../../base/constants/constants';

@Injectable()
export class GithubOAuth2Strategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: AuthService,
    protected readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALL_BACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const data = {
      userProviderId: profile.id,
      displayName: profile.displayName,
      email: profile?.emails[0]?.value,
      provider: profile.provider,
    };

    if (!data.email) {
      return exceptionHandler(
        ResultCode.BadRequest,
        githubEmailNotAvailable,
        emailField,
      );
    }

    const user = await this.authService.validateUser(data);

    return user || null;
  }
}
