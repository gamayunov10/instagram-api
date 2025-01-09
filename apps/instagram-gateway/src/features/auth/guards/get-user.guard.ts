import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../../users/api/application/users.service';

@Injectable()
export class GetUserIdByAuth implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    protected usersService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    const req = context.switchToHttp().getRequest();
    if (!req.headers.authorization || req.headers.authorization === undefined) {
      req.userId = null;
      return true;
    }
    const token = req.headers.authorization.split(' ')[1];
    const payload: any = await this.jwtService.decode(token);
    const user = await this.usersService.getUserById(payload.userId);
    if (!user) {
      req.userId = null;
      return true;
    }
    req.userId = payload.userId ? payload.userId : null;
    return true;
  }
}
