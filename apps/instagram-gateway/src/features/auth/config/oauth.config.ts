import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OAuthConfig {
  private readonly githubClientId: string;
  private readonly githubClientSecret: string;
  private readonly githubCallBackURL: string;
  private readonly googleClientId: string;
  private readonly googleClientSecret: string;
  private readonly googleCallBackURL: string;

  constructor(private readonly configService: ConfigService) {
    this.githubClientId = this.getSecret(
      'GITHUB_CLIENT_ID',
      'default_client_id',
    );
    this.githubClientSecret = this.getSecret(
      'GITHUB_CLIENT_SECRET',
      'default_client_secret',
    );
    this.githubCallBackURL = this.getSecret(
      'GITHUB_CALL_BACK_URL',
      'default_url_id',
    );
    this.googleClientId = this.getSecret(
      'GOOGLE_CLIENT_ID',
      'default_client_id',
    );
    this.googleClientSecret = this.getSecret(
      'GOOGLE_CLIENT_SECRET',
      'default_client_secret',
    );
    this.googleCallBackURL = this.getSecret(
      'GOOGLE_CALL_BACK_URL',
      'default_url_id',
    );
  }

  private getSecret(key: string, defaultValue: string): string {
    const secret = this.configService.get<string>(key, defaultValue);

    if (!secret) {
      if (this.configService.get<string>('ENV') === 'TESTING') {
        return defaultValue;
      }
      throw new Error(`Missing environment variable: ${key}`);
    }

    return secret;
  }

  get githubClientIdValue() {
    return this.githubClientId;
  }

  get githubClientSecretValue() {
    return this.githubClientSecret;
  }

  get githubCallBackURLValue() {
    return this.githubCallBackURL;
  }

  get googleClientIdValue() {
    return this.googleClientId;
  }

  get googleClientSecretValue() {
    return this.googleClientSecret;
  }

  get googleCallBackURLValue() {
    return this.googleCallBackURL;
  }
}
