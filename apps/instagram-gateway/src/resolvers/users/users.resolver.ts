import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UsersService } from '../../features/users/api/application/users.service';
import { BasicGqlGuard } from '../../infrastructure/guards/basic-gql-guard.service';
import { SortDirection } from '../../base/enums/sort/sort.direction.enum';

import { PaginatedUserModel } from './models/paginated-user.model';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => PaginatedUserModel)
  @UseGuards(BasicGqlGuard)
  async getUsers(
    @Args('page', { nullable: true, defaultValue: 1 }) page?: number,
    @Args('pageSize', { nullable: true, defaultValue: 8 }) pageSize?: number,
    @Args('sortBy', { defaultValue: 'username' }) sortBy?: string,
    @Args('sortOrder', {
      type: () => SortDirection,
      defaultValue: SortDirection.ASC,
    })
    sortOrder?: SortDirection,
    @Args('search', { nullable: true }) search?: string,
  ): Promise<PaginatedUserModel> {
    return this.usersService.getAllUsers(
      page,
      pageSize,
      sortBy,
      sortOrder,
      search,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(BasicGqlGuard)
  async deleteUser(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<boolean> {
    return this.usersService.removeUser(userId);
  }
}
