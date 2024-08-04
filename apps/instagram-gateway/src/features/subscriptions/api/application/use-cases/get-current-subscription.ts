import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { CurrentSubscriptionViewModel } from '../../../models/output/get-current-subscription';
import { SubscribersQueryRepository } from '../../../infrastructure/subscriber/subscriber.query.repo';
import { SubscriptionsService } from '../../subscriptions.service';
import { UsersQueryRepository } from '../../../../users/infrastructure/users.query.repo';

export class GetCurrentSubscriptionCommand {
  constructor(public readonly userId: string) {}
}
@CommandHandler(GetCurrentSubscriptionCommand)
export class GetCurrentSubscriptionUseCase
  implements ICommandHandler<GetCurrentSubscriptionCommand>
{
  private readonly logger = new Logger(GetCurrentSubscriptionUseCase.name);
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly subscribersQueryRepository: SubscribersQueryRepository,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}
  async execute(
    command: GetCurrentSubscriptionCommand,
  ): Promise<CurrentSubscriptionViewModel> {
    const user = await this.usersQueryRepository.findUserById(command.userId);
    const subscriber = await this.subscribersQueryRepository.findSubscriberById(
      command.userId,
    );
    if (!subscriber) {
      return {
        userId: user.id,
        expireAt: user.endDateOfSubscription,
        nextPayment: null,
        customerId: null,
        subscriptionId: null,
        autoRenewal: user.autoRenewal,
      };
    }
    const nextPayment =
      await this.subscriptionsService.nextPaymentDateOfSubscription(
        subscriber.subscriptionTime,
        user.endDateOfSubscription,
      );

    return {
      userId: user.id,
      expireAt: user.endDateOfSubscription,
      nextPayment: nextPayment,
      customerId: subscriber.customerId,
      subscriptionId: subscriber.id,
      autoRenewal: user.autoRenewal,
    };
  }
}
