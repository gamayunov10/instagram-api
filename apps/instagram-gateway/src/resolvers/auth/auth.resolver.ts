import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { BasicGqlGuard } from '../../infrastructure/guards/basic-gql-guard.service';
import { AuthBasicGqlGuard } from '../../infrastructure/guards/auth-gql-guard';
import { AuthService } from '../../features/auth/api/application/auth.service';

import { AuthLoginInput } from './models/auth-login-input.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String)
  @UseGuards(BasicGqlGuard)
  loginSa(): string {
    return 'Authorized user';
  }

  @Mutation(() => String)
  @UseGuards(AuthBasicGqlGuard)
  async authorizeSuperAdmin(
    @Args('authLoginInput') authLoginInput: AuthLoginInput,
  ): Promise<string> {
    return this.authService.createBasicAuthString(
      authLoginInput.email,
      authLoginInput.password,
    );
  }
}
