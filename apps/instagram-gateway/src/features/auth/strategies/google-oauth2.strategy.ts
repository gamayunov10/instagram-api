import { Inject, Injectable } from '@nestjs/common';
import { Profile, Strategy } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { AuthService } from '../api/application/auth.service';

@Injectable()
export class GoogleOAuth2Strategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject('AUTH_SERVICE')
    private readonly authService: AuthService,
    protected readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALL_BACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const data = {
      userProviderId: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      provider: profile.provider,
    };

    const user = await this.authService.validateUser(data);

    return user || null;
  }
}
