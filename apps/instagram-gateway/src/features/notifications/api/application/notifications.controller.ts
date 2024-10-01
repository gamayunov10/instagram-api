import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { SwaggerOptions } from '../../../../infrastructure/decorators/swagger.decorator';
import { NotificationQueryModel } from '../../models/notification.query.model';
import { DeviceAuthSessionGuard } from '../../../../infrastructure/guards/devie-auth-session.guard';
import { JwtBearerGuard } from '../../../auth/guards/jwt-bearer.guard';
import { UserIdFromGuard } from '../../../auth/decorators/user-id-from-guard.guard.decorator';
import { NotificationsSchema } from '../../../../base/schemas/notifications.schema';
import { ApiErrorMessages } from '../../../../base/schemas/api-error-messages.schema';
import { ResultCode } from '../../../../base/enums/result-code.enum';
import { exceptionHandler } from '../../../../infrastructure/exception-filters/exception-handler';
import { UpdateNotificationIsReadDto } from '../../models/update.notification.ids';
import { UnreadNotificationCountViewModel } from '../../models/unread.notification.count.view.model';

import { NotificationsService } from './notifications.service';

@Controller('notifications')
@ApiTags('Notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  @Put('/mark-as-read')
  @SwaggerOptions(
    'Mark notifications as read',
    true,
    false,
    204,
    'No Content',
    false,
    ` If input model has incorrect values`,
    ApiErrorMessages,
    true,
    false,
    false,
    false,
  )
  @UseGuards(DeviceAuthSessionGuard)
  @UseGuards(JwtBearerGuard)
  @HttpCode(204)
  async markNotificationsAsRead(
    @UserIdFromGuard() userId: string,
    @Body() notificationIds: UpdateNotificationIsReadDto,
  ) {
    const { ids } = notificationIds;
	// for(let i = 0; i < ids.length; i++) {
	// 	if(!ids[i].match("^\\{?\\p{XDigit}{8}-(?:\\p{XDigit}{4}-){3}\\p{XDigit}{12}}?$")) {
	// 		throw new NotFoundException('404')
	// 	}
	// }
    const result = await this.notificationsService.markNotificationsAsRead(
      userId,
      ids,
    );
    if (result.code !== ResultCode.Success) {
      return exceptionHandler(result.code);
    }
  }

  @Get()
  @SwaggerOptions(
    'View yours notifications',
    true,
    false,
    200,
    '',
    NotificationsSchema,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @UseGuards(DeviceAuthSessionGuard)
  @UseGuards(JwtBearerGuard)
  @HttpCode(200)
  async getNotifications(
    @UserIdFromGuard() userId: string,
    @Query() query: NotificationQueryModel,
  ) {
    return this.notificationsService.getNotificationsByUserId(userId, query);
  }

  @Get('unread-count')
  @SwaggerOptions(
    'Get unread notification count',
    true,
    false,
    200,
    '',
    UnreadNotificationCountViewModel,
    false,
    false,
    true,
    false,
    false,
    false,
  )
  @UseGuards(DeviceAuthSessionGuard)
  @UseGuards(JwtBearerGuard)
  async getUnreadNotificationCount(
    @UserIdFromGuard() userId: string,
  ): Promise<UnreadNotificationCountViewModel> {
    const count =
      await this.notificationsService.getUnreadNotificationCount(userId);
    return { count };
  }
}
