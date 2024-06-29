import { Controller, Get, HttpCode, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';

import { ResultCode } from '../../../base/enums/result-code.enum';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception-handler';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger.decorator';
import { UserPublicProfileOutputModel } from '../models/output/user.public.profile.output.model';
import { CountRegisteredUsers } from '../models/output/count.registered.users.model';

import { ViewUserPublicInfoCommand } from './application/use-cases/view-user-public-info.use-case';
import { GetTotalCountRegisteredUsersCommand } from './application/use-cases/get-total-count-registered-users';

@Controller('public-user')
@ApiTags('Public-User')
export class PublicUsersController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get()
  @SwaggerOptions(
    'Get total count registered users in app',
    false,
    false,
    200,
    'Get total count registered users',
    CountRegisteredUsers,
    false,
    false,
    false,
    false,
    true,
    false,
  )
  @HttpCode(200)
  async getTotalCountRegisteredUsers(): Promise<CountRegisteredUsers> {
    return await this.commandBus.execute(
      new GetTotalCountRegisteredUsersCommand(),
    );
  }

  @Get(':username')
  @SwaggerOptions(
    'Viewing a users public profile via a link',
    false,
    false,
    200,
    'Return information about the user public profile',
    UserPublicProfileOutputModel,
    false,
    false,
    false,
    false,
    true,
    false,
  )
  @HttpCode(200)
  async viewUserPublic(@Param('username') username: string): Promise<void> {
    const result = await this.commandBus.execute(
      new ViewUserPublicInfoCommand(username),
    );

    if (result.code === ResultCode.NotFound) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
