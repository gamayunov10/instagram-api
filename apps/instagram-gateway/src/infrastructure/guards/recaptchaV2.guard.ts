import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

import { ReCaptchaResponse } from '../../base/types/re-captcha.response.type';

@Injectable()
export class RecaptchaV2Guard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  async canActivate(context: ExecutionContext) {
    const { body } = context.switchToHttp().getRequest();

    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        response: body.reCaptcha,
        secret: this.configService.get('GOOGLE_RECAPTCHA_SECRET_KEY'),
      },
    );
    const data: ReCaptchaResponse = response.data;

    if (!data.success) {
      throw new ForbiddenException();
    }
    return true;
  }
}
