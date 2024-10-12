import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { UsersService } from '../../features/users/api/application/users.service';
import { BasicQclGuard } from '../../infrastructure/guards/basic-qcl.guard';

import { UserModel } from './models/user.model';

@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserModel])
  @UseGuards(BasicQclGuard)
  async getUsers(): Promise<UserModel[]> {
    return this.usersService.getAllUsers();
  }
}
