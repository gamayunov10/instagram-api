import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { AuthService } from '../../features/auth/api/application/auth.service';

@Injectable()
export class BasicGqlGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context).getContext();
    const request = ctx.req;
    console.log(ctx);

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [authType, credentials] = authHeader.split(' ');
    if (authType !== 'Basic' || !credentials) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }
    return this.authService.validateAuthorization(authHeader);
  }
}
