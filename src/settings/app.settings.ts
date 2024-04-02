import * as process from 'process';
import cookieParser from 'cookie-parser';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { config } from 'dotenv';
import { AppModule } from '../app.module';

config();

export const APP_PREFIX = '';

export type EnvironmentVariable = {
  [key: string]: string | undefined;
};

export type EnvironmentsTypes =
  | 'DEVELOPMENT'
  | 'STAGING'
  | 'PRODUCTION'
  | 'TESTING';

export const Environments = ['DEVELOPMENT', 'STAGING', 'PRODUCTION', 'TESTING'];

export class EnvironmentSettings {
  constructor(private env: EnvironmentsTypes) {}

  getEnv() {
    return this.env;
  }

  isProduction() {
    return this.env === 'PRODUCTION';
  }

  isStaging() {
    return this.env === 'STAGING';
  }

  isDevelopment() {
    return this.env === 'DEVELOPMENT';
  }

  isTesting() {
    return this.env === 'TESTING';
  }
}

class APISettings {
  // Application
  public readonly APP_PORT: number;

  // Urls & CORS
  public readonly PUBLIC_FRONT_URL: string;

  // Database
  public readonly DATABASE_URL: string;
  public readonly TEST_DATABASE_URL: string;

  constructor(private readonly envVariables: EnvironmentVariable) {
    // Application
    this.APP_PORT = this.getNumberOrDefault(this.envVariables.APP_PORT, 9876);

    // Urls & CORS
    this.PUBLIC_FRONT_URL =
      this.envVariables.PUBLIC_FRONT_URL ?? 'https://inctagram.org';

    // Database
    this.DATABASE_URL = this.envVariables.DATABASE_URL;
    this.TEST_DATABASE_URL = this.envVariables.TEST_DATABASE_URL;
  }

  private getNumberOrDefault(value: string, defaultValue: number): number {
    const parsedValue = Number(value);

    if (isNaN(parsedValue)) {
      return defaultValue;
    }

    return parsedValue;
  }
}

export class AppSettings {
  constructor(
    public env: EnvironmentSettings,
    public api: APISettings,
  ) {}

  applySettings(app: INestApplication) {
    app.enableCors();
    app.use(cookieParser());

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    this.setAppPrefix(app);
    this.setSwagger(app);
    this.setAppPipes(app);
  }

  private setAppPrefix(app: INestApplication) {
    app.setGlobalPrefix(APP_PREFIX);
  }

  private setSwagger(app: INestApplication) {
    if (this.env.isDevelopment()) {
      const swaggerPath = APP_PREFIX + '/doc';

      const config = new DocumentBuilder()
        .setTitle('INSTAGRAM API')
        .addBearerAuth()
        .setVersion('1.0')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup(swaggerPath, app, document, {
        customSiteTitle: 'INSTAGRAM Documentation',
      });
    }
  }

  private setAppPipes(app: INestApplication) {
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        stopAtFirstError: true,
      }),
    );
  }
}

const env = new EnvironmentSettings(
  (Environments.includes(process.env.ENV)
    ? process.env.ENV
    : 'DEVELOPMENT') as EnvironmentsTypes,
);

const api = new APISettings(process.env);

export const appSettings = new AppSettings(env, api);
