import { UseGuards } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Loader } from 'nestjs-dataloader';
import DataLoader from 'dataloader';

import { UsersService } from '../../features/users/api/application/users.service';
import { BasicGqlGuard } from '../../infrastructure/guards/basic-gql-guard.service';
import { exceptionHandler } from '../../infrastructure/exception-filters/exception-handler';
import { ResultCode } from '../../base/enums/result-code.enum';
import { FileModel } from '../posts/models/file-model';
import { UserImagesLoader } from '../../base/data-loaders/user-images-loader';

import { PaginatedUserModel } from './models/paginated-user.model';
import { UserModel } from './models/user.model';
import { PaginationInputUsers } from './models/pagination-users-input';

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

  @ResolveField(() => [FileModel], { nullable: true })
  async imagesUser(
    @Parent() user: UserModel,
    @Loader(UserImagesLoader)
    userImagesLoader: DataLoader<string, UserImagesLoader>,
  ) {
    return await userImagesLoader.load(user.id);
  }

  @Query(() => PaginatedUserModel)
  @UseGuards(BasicGqlGuard)
  async getUsers(
    @Args('pagination', { type: () => PaginationInputUsers, nullable: true })
    pagination: PaginationInputUsers,
  ): Promise<PaginatedUserModel> {
    return this.usersService.getAllUsers(
      pagination.page,
      pagination.pageSize,
      pagination.sortBy,
      pagination.sortOrder,
      pagination.search,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(BasicGqlGuard)
  async deleteUser(
    @Args('userId', { type: () => String }) userId: string,
  ): Promise<boolean> {
    const res = await this.usersService.removeUser(userId);
    if (!res) {
      exceptionHandler(ResultCode.NotFound, 'User not found', 'id');
    }
    return true;
  }
}
