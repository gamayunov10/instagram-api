import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PaymentManager } from '../../base/application/managers/payment.manager';

import { PaymentsRepository } from './infrastructure/payments.repo';
import { PaymentsQueryRepository } from './infrastructure/payments.query.repo';
import { PaymentsController } from './api/payments.controller';
import { PaymentsService } from './api/payments.service';
import { StripeSignatureUseCase } from './api/applications/use-cases/stripe-signature.use-case';

const providers = [PaymentsService];
const repositories = [PaymentsRepository];
const queryRepositories = [PaymentsQueryRepository];
const useCases = [StripeSignatureUseCase];
const managers = [PaymentManager];

@Module({
  imports: [CqrsModule],
  controllers: [PaymentsController],
  providers: [
    ...providers,
    ...repositories,
    ...queryRepositories,
    ...useCases,
    ...managers,
  ],
})
export class PaymentsModule {}
