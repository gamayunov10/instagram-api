import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UserDevicesQueryRepository } from '../../features/user/infrastructure/user.devices.query.repo';

@Injectable()
export class CheckRefreshToken implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userDevicesQueryRepo: UserDevicesQueryRepository,

    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const cookiesRefreshToken = req.cookies.refreshToken;
    if (!cookiesRefreshToken) {
      throw new HttpException(
        'UNAUTHORIZED now token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const refreshTokenPayload = await this.jwtService.verify(
        cookiesRefreshToken,
        this.configService.get('REFRESH_TOKEN_SECRET'),
      );
      if (refreshTokenPayload.exp < new Date().getTime()) {
        return null;
      }
      const res = await this.userDevicesQueryRepo.findUserByDeviceId(
        refreshTokenPayload.userId,
        refreshTokenPayload.deviceId,
      );
      if (!res) {
        return null;
      }
    } catch (error) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
}
