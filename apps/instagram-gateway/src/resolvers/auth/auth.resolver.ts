import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { BasicAuthGuard } from '../../features/auth/guards/basic.guard';

@Resolver()
export class AuthResolver {
  constructor() {}

  @Query(() => String)
  @UseGuards(BasicAuthGuard)
  loginSa(): string {
    return 'Authorized user';
  }
}
