import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthBasicGqlGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);

    // Получаем аргументы GraphQL-запроса
    const args = ctx.getArgs();
    const { authLoginInput } = args;
    const { email, password } = authLoginInput || {};
    // Логика авторизации

    const validEmail = this.configService.get<string>('BASIC_AUTH_USERNAME');
    const validPassword = this.configService.get<string>('BASIC_AUTH_PASSWORD');

    if (email !== validEmail || password !== validPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return true;
  }
}
