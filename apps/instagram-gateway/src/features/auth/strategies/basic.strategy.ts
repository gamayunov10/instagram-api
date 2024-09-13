import { PassportStrategy } from '@nestjs/passport';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Strategy } from 'passport-local';

import { StrategyType } from '../../../base/enums/strategy-type.enum';

@Injectable()
export class BasicStrategy extends PassportStrategy(
  Strategy,
  StrategyType.BASIC,
) {
  getRequest(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return request;
  }

  async validate(username: string, password: string): Promise<any> {
    // Здесь вы можете проверить учетные данные в БД
    if (username === 'admin@instagram.org' && password === 'password') {
      return { username }; // Возвращаем объект пользователя
    } else {
      throw new UnauthorizedException();
    }
  }
}
