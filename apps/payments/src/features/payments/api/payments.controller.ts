import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { PaymentsRepository } from '../infrastructure/payments.repo';

import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentsService: PaymentsService,
  ) {}
}
