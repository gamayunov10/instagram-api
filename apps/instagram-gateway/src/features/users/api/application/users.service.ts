import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UsersRepository } from '../../infrastructure/users.repo';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}
}
