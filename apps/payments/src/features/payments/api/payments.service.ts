import { Injectable } from '@nestjs/common';

import { PaymentsQueryRepository } from '../infrastructure/payments.query.repo';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsQueryRepository: PaymentsQueryRepository,
  ) {}
  getHello(): string {
    return 'Payments started!';
  }
}
