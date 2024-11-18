import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { BasicGqlGuard } from '../../infrastructure/guards/basic-gql-guard.service';
import { SubscriptionsService } from '../../features/subscriptions/api/subscriptions.service';
import { UserModel } from '../users/models/user.model';
import { UserLoader } from '../../base/data-loaders/user-loader';

import { SubscriptionPaymentsModel } from './models/subscription.payments.model';
import { PaginatedPaymentsModel } from './models/paginated-payments.model';
import { PaginationInputPayments } from './models/pagination-payments-input';

@Resolver(() => SubscriptionPaymentsModel)
export class PaymentsResolver {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly userLoader: UserLoader, // Внедряем экземпляр UserLoader
  ) {}

  @Query(() => PaginatedPaymentsModel)
  @UseGuards(BasicGqlGuard)
  async getPayments(
    @Args('pagination', { type: () => PaginationInputPayments, nullable: true })
    pagination: PaginationInputPayments,
  ): Promise<PaginatedPaymentsModel> {
    return this.subscriptionsService.getAllPayments(pagination);
  }

  @ResolveField(() => UserModel, { nullable: true })
  async user(@Parent() subscriptionPaymentsModel: SubscriptionPaymentsModel) {
    return this.userLoader
      .generateDataLoader()
      .load(subscriptionPaymentsModel.userId);
  }
}
