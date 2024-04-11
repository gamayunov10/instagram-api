import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import { StrategyType } from '../../../base/enums/strategy-type.enum';
import { refreshTokenExtractor } from '../utils/refresh-token-extractor';
import { ValidateRefreshTokenCommand } from '../api/application/use-cases/validations/validate-refresh-token.usecase';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  StrategyType.REFRESH,
) {
  constructor(
    private commandBus: CommandBus,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: refreshTokenExtractor,
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: any) {
    const result = await this.commandBus.execute(
      new ValidateRefreshTokenCommand(payload),
    );

    if (!result) {
      throw new UnauthorizedException();
    }

    return {
      id: payload.userId,
    };
  }
}
