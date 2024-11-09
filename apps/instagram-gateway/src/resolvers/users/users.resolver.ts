import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UsersService } from '../../features/users/api/application/users.service';
import { BasicGqlGuard } from '../../infrastructure/guards/basic-gql-guard.service';
import { exceptionHandler } from '../../infrastructure/exception-filters/exception-handler';
import { ResultCode } from '../../base/enums/result-code.enum';
import { PaginationInputGql } from '../../base/pagination/pagination-input-gql';

import { PaginatedUserModel } from './models/paginated-user.model';
import { UserModel } from './models/user.model';

@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}
  @Query(() => UserModel, { nullable: true })
  @UseGuards(BasicGqlGuard)
  async getUser(@Args('id') id: string): Promise<UserModel> {
    const user = await this.usersService.getUserById(id);
    if (!user) {
      exceptionHandler(ResultCode.NotFound, 'User not found', 'id');
    }
    return user;
  }

  @Query(() => PaginatedUserModel)
  @UseGuards(BasicGqlGuard)
  async getUsers(
    @Args('pagination', { type: () => PaginationInputGql, nullable: true })
    pagination: PaginationInputGql,
    @Args('search', { nullable: true }) search?: string,
  ): Promise<PaginatedUserModel> {
    return this.usersService.getAllUsers(
      pagination.page,
      pagination.pageSize,
      pagination.sortBy,
      pagination.sortOrder,
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
