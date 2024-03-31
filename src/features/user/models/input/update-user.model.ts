import { PartialType } from '@nestjs/mapped-types';
import { CreateUserModel } from './create-user.model';

export class UpdateUserModel extends PartialType(CreateUserModel) {}
