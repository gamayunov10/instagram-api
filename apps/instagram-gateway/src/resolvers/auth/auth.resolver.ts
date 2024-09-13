import { UseGuards } from '@nestjs/common';
import { Mutation, Query, Resolver } from '@nestjs/graphql';

import { BasicAuthGuard } from '../../features/auth/guards/basic.guard';

@Resolver()
export class AuthResolver {
  constructor() {}

  @Query(() => String)
  hello() {
    return 'Hello World!';
  }
  @UseGuards(BasicAuthGuard)
  @Mutation(() => String)
  async loginSa() {
    return true;
  }
}
