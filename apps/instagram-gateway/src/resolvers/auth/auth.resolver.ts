import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { BasicGqlGuard } from '../../infrastructure/guards/basic-gql-guard.service';

@Resolver()
export class AuthResolver {
  constructor() {}

  @Query(() => String)
  @UseGuards(BasicGqlGuard)
  loginSa(): string {
    return 'Authorized user';
  }
}
