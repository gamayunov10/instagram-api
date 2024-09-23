import { ApiProperty } from '@nestjs/swagger';

import { NotificationViewModel } from '../../features/notifications/models/notification.view.model';

import { PaginatorSchema } from './paginator.schema';

export class NotificationsSchema extends PaginatorSchema {
  @ApiProperty({
    type: Array(NotificationViewModel),
  })
  'items': NotificationViewModel[];
}
