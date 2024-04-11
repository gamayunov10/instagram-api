import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtConfig {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.accessTokenSecret = this.getSecret('ACCESS_TOKEN_SECRET');
    this.refreshTokenSecret = this.getSecret('REFRESH_TOKEN_SECRET');
  }

  private getSecret(key: string): string {
    const secret = this.configService.get<string>(key);

    if (!secret) {
      throw new Error(`Missing environment variable: ${key}`);
    }

    return secret;
  }

  get accessSecret() {
    return this.accessTokenSecret;
  }

  get refreshSecret() {
    return this.refreshTokenSecret;
  }
}
