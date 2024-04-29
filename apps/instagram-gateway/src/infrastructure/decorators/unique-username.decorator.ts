import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

import { UsersQueryRepository } from '../../features/user/infrastructure/users.query.repo';

@ValidatorConstraint({ name: 'IsUsernameAlreadyExist', async: true })
@Injectable()
export class IsUsernameAlreadyExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}
  async validate(username: string): Promise<boolean> {
    if (!username) {
      throw new Error('Username is required');
    }

    const user = await this.usersQueryRepository.findUserByUsername(username);
    return !user;
  }
}

export const IsUsernameAlreadyExist =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameAlreadyExistConstraint,
    });
  };
