import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CreateUserModel } from './models/input/create-user.model';
import { UpdateUserModel } from './models/input/update-user.model';
import { UsersRepository } from './infrastructure/users.repo';

@Injectable()
export class UserService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}
  create(createUserModel: CreateUserModel) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserModel: UpdateUserModel) {
    return `This action updates a #${id} user`;
  }

  deleteUser(id: string) {
    return this.usersRepository.deleteUser(id);
  }
}
