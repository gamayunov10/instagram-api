import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import * as process from 'process';

import { StrategyType } from '../../../base/enums/strategy-type.enum';

@Injectable()
export class JwtBearerStrategy extends PassportStrategy(
  Strategy,
  StrategyType.BEARER,
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.userId,
    };
  }
}
