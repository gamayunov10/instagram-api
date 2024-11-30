import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { BasicGqlGuard } from '../../infrastructure/guards/basic-gql-guard.service';
import { SubscriptionsService } from '../../features/subscriptions/api/subscriptions.service';
import { UserModel } from '../users/models/user.model';
import { UserLoader } from '../../base/data-loaders/user-loader';

import { SubscriptionPaymentsModel } from './models/subscription.payments.model';
import { PaginatedPaymentsModel } from './models/paginated-payments.model';
import { PaginationInputPayments } from './models/pagination-payments-input';
import { PaginationInputPaymentsWithSearch } from './models/pagination-payments-input-with-search';

@Resolver(() => SubscriptionPaymentsModel)
export class PaymentsResolver {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly userLoader: UserLoader, // Внедряем экземпляр UserLoader
  ) {}

  @Query(() => PaginatedPaymentsModel)
  @UseGuards(BasicGqlGuard)
  async getPayments(
    @Args('pagination', {
      type: () => PaginationInputPaymentsWithSearch,
      nullable: true,
    })
    pagination: PaginationInputPaymentsWithSearch,
  ): Promise<PaginatedPaymentsModel> {
    return this.subscriptionsService.getAllPayments(pagination);
  }

  @Query(() => PaginatedPaymentsModel)
  @UseGuards(BasicGqlGuard)
  async getPaymentsByUser(
    @Args('pagination', {
      type: () => PaginationInputPayments,
      nullable: true,
    })
    pagination: PaginationInputPayments,
    @Args('userId') userId: string,
  ): Promise<PaginatedPaymentsModel> {
    return this.subscriptionsService.getAllPaymentsByUser(userId, pagination);
  }

  @ResolveField(() => UserModel, { nullable: true })
  async user(@Parent() subscriptionPaymentsModel: SubscriptionPaymentsModel) {
    return this.userLoader
      .generateDataLoader()
      .load(subscriptionPaymentsModel.userId);
  }
}
