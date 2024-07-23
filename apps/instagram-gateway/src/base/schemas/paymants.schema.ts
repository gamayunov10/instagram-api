import { ApiProperty } from '@nestjs/swagger';

import { PaymentsViewModel } from '../../features/subscriptions/models/output/paymants.view.model';

import { PaginatorSchema } from './paginator.schema';

export class GetMyPayments extends PaginatorSchema {
  @ApiProperty({
    type: Array(PaymentsViewModel),
  })
  'items': [PaymentsViewModel];
}
