import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';

import { UserProfileInputModel } from '../models/input/user.profile.input.model';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception-handler';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger.decorator';
import { ApiErrorMessages } from '../../../base/schemas/api-error-messages.schema';
import { UserProfileOutputModel } from '../models/output/user.profile.output.model';

import { FillOutProfileCommand } from './application/use-cases/fill-out-profile.use-case';
import { GetInfoProfileCommand } from './application/use-cases/get-info-profile.use-case';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly commandBus: CommandBus) {}

  @SwaggerOptions(
    'Get profile information',
    true,
    false,
    200,
    'Return information about the user profile',
    UserProfileOutputModel,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @Get('profile-information')
  @UseGuards(JwtBearerGuard)
  @HttpCode(200)
  async getInformation(@UserIdFromGuard() userId: string): Promise<void> {
    const result = await this.commandBus.execute(
      new GetInfoProfileCommand(userId),
    );
    if (result.code === ResultCode.Unauthorized) {
      return exceptionHandler(result.code, result.message, result.field);
    }
    return result;
  }

  @Put('fill-out-profile')
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
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Settings are not saved',
  })
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async fillOutProfile(
    @UserIdFromGuard() userId: string,
    @Body() userProfileInputModel: UserProfileInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new FillOutProfileCommand(userId, userProfileInputModel),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
