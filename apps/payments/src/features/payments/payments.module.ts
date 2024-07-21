import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PaymentManager } from '../../base/application/managers/payment.manager';
import { PaypalAdapter } from '../../base/application/adapters/paypal.adapter';

import { PaymentsRepository } from './infrastructure/payments.repo';
import { PaymentsQueryRepository } from './infrastructure/payments.query.repo';
import { PaymentsController } from './api/payments.controller';
import { PaymentsService } from './api/payments.service';
import { StripeSignatureUseCase } from './api/applications/use-cases/stripe-signature.use-case';
import { PaypalCaptureUseCase } from './api/applications/use-cases/paypal-capture.use-case';
import { VerifyPaypalSignatureUseCase } from './api/applications/use-cases/verify-paypal.use-case';

const adapters = [PaypalAdapter];
const providers = [PaymentsService];
const repositories = [PaymentsRepository];
const queryRepositories = [PaymentsQueryRepository];
const useCases = [
  StripeSignatureUseCase,
  PaypalCaptureUseCase,
  VerifyPaypalSignatureUseCase,
];
const managers = [PaymentManager];

@Module({
  imports: [CqrsModule],
  controllers: [PaymentsController],
  providers: [
    ...adapters,
    ...providers,
    ...repositories,
    ...queryRepositories,
    ...useCases,
    ...managers,
  ],
})
export class PaymentsModule {}
