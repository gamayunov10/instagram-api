import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { AuthService } from '../../features/auth/api/application/auth.service';

@Injectable()
export class BasicGqlSubscriptionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context).getContext();

    const connectionParams = gqlContext.connectionParams;

    if (!connectionParams || !connectionParams.authorization) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const authHeader = connectionParams.authorization;
    const [authType, credentials] = authHeader.split(' ');

    if (authType !== 'Basic' || !credentials) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    return this.authService.validateAuthorization(authHeader);
  }
}
