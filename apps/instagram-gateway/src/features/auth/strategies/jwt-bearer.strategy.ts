import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { StrategyType } from '../../../base/enums/strategy-type.enum';
import { JwtConfig } from '../config/jwt.config';
import { JWTATPayload } from '../../../base/interfaces/access-token-payload.interface';

@Injectable()
export class JwtBearerStrategy extends PassportStrategy(
  Strategy,
  StrategyType.BEARER,
) {
  constructor(private readonly jwtConfig: JwtConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.accessSecret,
    });
  }

  async validate(payload: JWTATPayload) {
    return {
      id: payload.userId,
    };
  }
}
