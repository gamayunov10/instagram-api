import { BasicStrategy as Strategy } from 'passport-http';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { StrategyType } from '../../../base/enums/strategy-type.enum';

@Injectable()
export class BasicStrategy extends PassportStrategy(
  Strategy,
  StrategyType.BASIC,
) {
  constructor() {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    if (username === 'admin@inctagram.org' && password === 'Password1!') {
      return { username };
    }
    throw new UnauthorizedException();
  }
}
