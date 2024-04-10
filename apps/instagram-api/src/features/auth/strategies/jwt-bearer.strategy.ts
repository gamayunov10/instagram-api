import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { StrategyType } from '../../../base/enums/strategy-type.enum';

@Injectable()
export class JwtBearerStrategy extends PassportStrategy(
  Strategy,
  StrategyType.BEARER,
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.userId,
    };
  }
}
