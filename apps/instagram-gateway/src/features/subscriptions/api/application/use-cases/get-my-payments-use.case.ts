import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { ResultCode } from '../../../../../base/enums/result-code.enum';
import {
  userIdField,
  userNotFound,
} from '../../../../../base/constants/constants';
import { UsersQueryRepository } from '../../../../users/infrastructure/users.query.repo';
import { MyPaymentsQueryModel } from '../../../models/query/my-paymants.query.model';
import { SubscriptionsQueryRepository } from '../../../infrastructure/subscriptions.query.repo';
import { Paginator } from '../../../../../base/pagination/paginator';
import { PaymentsViewModel } from '../../../models/output/paymants.view.model';
import { SubscriptionTime } from '../../../../../../../../libs/common/base/ts/enums/subscription-time.enum';
import { PaymentType } from '../../../../../../../../libs/common/base/ts/enums/payment-type.enum';

export class GetMyPaymentsHookCommand {
  constructor(
    public readonly userId: string,
    public readonly queryModel: MyPaymentsQueryModel,
  ) {}
}
@CommandHandler(GetMyPaymentsHookCommand)
export class GetMyPaymentsUseCase
  implements ICommandHandler<GetMyPaymentsHookCommand>
{
  private readonly logger = new Logger(GetMyPaymentsUseCase.name);
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly subscriptionsQueryRepo: SubscriptionsQueryRepository,
  ) {}
  async execute(command: GetMyPaymentsHookCommand) {
    const user = await this.usersQueryRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.Unauthorized,
        field: userIdField,
        message: userNotFound,
      };
    }

    const payments = await this.subscriptionsQueryRepo.getMyPayments(
      command.userId,
      command.queryModel,
    );

    if (payments.payments.length === 0) {
      return {
        data: true,
        code: ResultCode.Success,
        response: Paginator.paginate({
          pageNumber: Number(command.queryModel.page),
          pageSize: Number(command.queryModel.pageSize),
          totalCount: 0,
          items: [],
        }),
      };
    }

    const items: PaymentsViewModel[] = payments.payments.map((p) => {
      return {
        userId: p.userId,
        dateOfPayment: p.createdAt,
        price: p.price,
        subscriptionTimeType: p.subscriptionTime as SubscriptionTime,
        paymentType: p.payment.paymentSystem as PaymentType,
      };
    });

    return {
      data: true,
      code: ResultCode.Success,
      response: Paginator.paginate({
        pageNumber: Number(command.queryModel.page),
        pageSize: Number(command.queryModel.pageSize),
        totalCount: payments.totalCount,
        items: items,
      }),
    };
  }
}
