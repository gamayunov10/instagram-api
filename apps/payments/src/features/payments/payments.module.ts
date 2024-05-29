import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { PaymentsRepository } from './infrastructure/payments.repo';
import { PaymentsQueryRepository } from './infrastructure/payments.query.repo';
import { PaymentsController } from './api/payments.controller';
import { PaymentsService } from './api/payments.service';

const providers = [PaymentsService];
const repositories = [PaymentsRepository];
const queryRepositories = [PaymentsQueryRepository];
const useCases = [];

@Module({
  imports: [CqrsModule],
  controllers: [PaymentsController],
  providers: [...providers, ...repositories, ...queryRepositories, ...useCases],
})
export class PaymentsModule {}
