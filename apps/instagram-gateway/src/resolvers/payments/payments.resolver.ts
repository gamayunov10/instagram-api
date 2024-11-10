import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { BasicGqlGuard } from '../../infrastructure/guards/basic-gql-guard.service';
import { SubscriptionsService } from '../../features/subscriptions/api/subscriptions.service';

import { SubscriptionPaymentsModel } from './models/subscription.payments.model';
import { PaginatedPaymentsModel } from './models/paginated-payments.model';
import { PaginationInputPayments } from './models/pagination-payments-input';

@Resolver(() => SubscriptionPaymentsModel)
export class SubscriptionPaymentsResolver {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Query(() => PaginatedPaymentsModel)
  @UseGuards(BasicGqlGuard)
  async getSubscriptionPayments(
    @Args('pagination', { type: () => PaginationInputPayments, nullable: true })
    pagination: PaginationInputPayments,
  ): Promise<PaginatedPaymentsModel> {
    return this.subscriptionsService.getAllPayments(pagination);
  }
}
