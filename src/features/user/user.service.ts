import { Injectable } from '@nestjs/common';

import { CreateUserModel } from './models/input/create-user.model';
import { UpdateUserModel } from './models/input/update-user.model';

@Injectable()
export class UserService {
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
