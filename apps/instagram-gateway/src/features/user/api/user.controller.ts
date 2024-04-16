import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerOptions } from 'apps/instagram-gateway/src/infrastructure/decorators/swagger.decorator';
import { ApiErrorMessages } from 'apps/instagram-gateway/src/base/schemas/api-error-messages.schema';
import { CommandBus } from '@nestjs/cqrs';

import { UserProfileInputModel } from '../models/input/user.profile.input.model';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';

import { UserService } from './application/user.service';
import { FillOutProfileCommand } from './application/use-cases/fill-out-profile.use-case';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly userService: UserService,
  ) {}

  @Post('fill-out-profile')
  @SwaggerOptions(
    'Fill out profile',
    true,
    false,
    204,
    'Input data is accepted. Settings are saved',
    false,
    'If the inputModel has incorrect values',
    ApiErrorMessages,
    true,
    false,
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async fillOutProfile(
    @UserIdFromGuard() userId: string,
    @Body() userProfileInputModel: UserProfileInputModel,
  ): Promise<void> {
    return await this.commandBus.execute(
      new FillOutProfileCommand(userId, userProfileInputModel),
    );
  }
}
