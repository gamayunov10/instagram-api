import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';

import { UserProfileInputModel } from '../models/input/user.profile.input.model';
import { JwtBearerGuard } from '../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../auth/decorators/user-id-from-guard.guard.decorator';
import { ResultCode } from '../../../base/enums/result-code.enum';
import { exceptionHandler } from '../../../infrastructure/exception-filters/exception-handler';
import { SwaggerOptions } from '../../../infrastructure/decorators/swagger.decorator';
import { ApiErrorMessages } from '../../../base/schemas/api-error-messages.schema';
import { UserProfileOutputModel } from '../models/output/user.profile.output.model';
import { UserImageInputModel } from '../models/input/user.image.input.model';

import { FillOutProfileCommand } from './application/use-cases/fill-out-profile.use-case';
import { GetProfileInfoCommand } from './application/use-cases/get-profile-info-use.case';
import { UploadUserPhotoCommand } from './application/use-cases/upload-user-photo.use-case';
import { DeleteUserPhotoCommand } from './application/use-cases/delete-user-photo.use-case';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get('profile-information')
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
  @UseGuards(JwtBearerGuard)
  @HttpCode(200)
  async getProfileInfo(@UserIdFromGuard() userId: string): Promise<void> {
    const result = await this.commandBus.execute(
      new GetProfileInfoCommand(userId),
    );

    if (result.code === ResultCode.Unauthorized) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }

  @Post('upload-user-photo')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'User photo (JPEG, PNG) not exceeding 10 MB',
        },
      },
      required: ['file'],
    },
  })
  @SwaggerOptions(
    'Upload user photo',
    true,
    false,
    204,
    'User photo are saved',
    false,
    'If photo has incorrect format or size exceeding 10 MB',
    ApiErrorMessages,
    true,
    false,
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(204)
  async uploadUserPhoto(
    @UserIdFromGuard() userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }),
          new FileTypeValidator({ fileType: 'image/jpeg|image/png' }),
        ],
        fileIsRequired: true,
        exceptionFactory: (e) => {
          throw new BadRequestException([{ message: e, field: 'file' }]);
        },
      }),
    )
    file: Express.Multer.File,
  ): Promise<void> {
    const data: UserImageInputModel = {
      userId,
      originalName: file.originalname,
      buffer: file.buffer,
    };

    const result = await this.commandBus.execute(
      new UploadUserPhotoCommand(data),
    );

    if (result.code === ResultCode.Success) {
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

  @Delete('delete-user-photo')
  @SwaggerOptions(
    'Delete user photo',
    true,
    false,
    204,
    'User photo has been deleted',
    false,
    'If JWT access token is incorrect',
    ApiErrorMessages,
    true,
    false,
    false,
    false,
  )
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async deleteUserPhoto(@UserIdFromGuard() userId: string): Promise<void> {
    const result = await this.commandBus.execute(
      new DeleteUserPhotoCommand(userId),
    );

    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code, result.message, result.field);
    }

    return result;
  }
}
