import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import { CreateSubscriptionInputModel } from '../../../models/input/create-subscription.input.model';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import { SubscriptionsRepository } from '../../../infrastructure/subscriptions.repo';
import { SubscriptionsQueryRepository } from '../../../infrastructure/subscriptions.query.repo';
import {
  subscriptionNotAvailable,
  subscriptionTimeTypeField,
  userIdField,
  userNotFound,
} from '../../../../../base/constants/constants';
import { UsersQueryRepository } from '../../../../users/infrastructure/users.query.repo';
import { PaymentsServiceAdapter } from '../../../../../base/application/adapters/payments-service.adapter';
import { MakePaymentRequest } from '../../../../../../../../libs/common/base/subscriptions/make-payment-request';
import { PaymentTransactionPayloadType } from '../../../models/types/payment-transaction-payload.type';
import { OrderPayloadType } from '../../../models/types/order-payload.type';
import { UsersRepository } from '../../../../users/infrastructure/users.repo';
import { PaymentIds } from '../../../../../../../../libs/common/base/ts/enums/payment-ids.enum';

export class BuySubscriptionsCommand {
  constructor(
    public createSubscriptionInputModel: CreateSubscriptionInputModel,
    public userId: string,
  ) {}
}

@CommandHandler(BuySubscriptionsCommand)
export class BuySubscriptionsUseCase
  implements ICommandHandler<BuySubscriptionsCommand>
{
  constructor(
    private readonly subscriptionsRepo: SubscriptionsRepository,
    private readonly subscriptionsQueryRepo: SubscriptionsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
  ) {}

  async execute(command: BuySubscriptionsCommand) {
    const user = await this.usersQueryRepository.findUserById(command.userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.Unauthorized,
        field: userIdField,
        message: userNotFound,
      };
    }

    const availableSubscription =
      await this.subscriptionsQueryRepo.findAvailableSubscription(
        command.createSubscriptionInputModel.subscriptionTimeType,
      );

    if (!availableSubscription) {
      return {
        data: false,
        code: ResultCode.OutOfStock,
        field: subscriptionTimeTypeField,
        message: `${subscriptionNotAvailable}: ${command.createSubscriptionInputModel.subscriptionTimeType}`,
      };
    }

    const createdPaymentTrPayload: PaymentTransactionPayloadType = {
      price: 0,
      paymentSystem: command.createSubscriptionInputModel.paymentType,
      status: '',
      url: '',
      openedPaymentData: '',
      confirmedPaymentData: '',
    };

    const createdPaymentTr =
      await this.subscriptionsRepo.createPaymentTransaction(
        createdPaymentTrPayload,
      );

    const payload: MakePaymentRequest = {
      paymentType: command.createSubscriptionInputModel.paymentType,
      success_url: this.configService.get<string>('PAYMENT_SUCCESS_URL'),
      cancel_url: this.configService.get<string>('PAYMENT_CANCEL_URL'),
      product_data: {
        name: command.createSubscriptionInputModel.subscriptionTimeType,
        description: `${command.createSubscriptionInputModel.subscriptionTimeType} subscription`,
      },
      unit_amount: availableSubscription.price,
      quantity: Number(command.createSubscriptionInputModel.amount),
      client_reference_id: createdPaymentTr,
      interval: command.createSubscriptionInputModel.subscriptionTimeType,
      user: user,
    };

    let result;

    if (!command.createSubscriptionInputModel.autoRenewal) {
      result = await this.paymentsServiceAdapter.makePayment(payload);
    } else {
      result =
        await this.paymentsServiceAdapter.createAutoSubscription(payload);
    }

    if (!result.data) {
      return {
        data: false,
        code: ResultCode.InternalServerError,
      };
    }

    const paymentTransactionsPayload = {
      price:
        availableSubscription.price *
        command.createSubscriptionInputModel.amount,
      paymentSystem: command.createSubscriptionInputModel.paymentType,
      status: result.res.response.status,
      url: result.res.response.url,
      openedPaymentData: result.res.response.openedPaymentData,
      confirmedPaymentData: null,
    };

    const paymentTransactionId =
      await this.subscriptionsRepo.updateAllPaymentTransaction(
        createdPaymentTr,
        paymentTransactionsPayload,
      );

    if (!paymentTransactionId) {
      return {
        data: false,
        code: ResultCode.InternalServerError,
      };
    }

    const orderPayload: OrderPayloadType = {
      userId: command.userId,
      productId:
        PaymentIds[command.createSubscriptionInputModel.subscriptionTimeType],
      price:
        availableSubscription.price *
        command.createSubscriptionInputModel.amount,
      paymentId: paymentTransactionId.toString(),
      subscriptionTime:
        command.createSubscriptionInputModel.subscriptionTimeType,
    };

    const order = await this.subscriptionsRepo.createOrder(
      orderPayload,
      command.userId,
    );

    if (!order) {
      return {
        data: false,
        code: ResultCode.InternalServerError,
      };
    }

    return {
      data: true,
      code: ResultCode.Success,
      response: { url: result.res.response.url },
    };
  }
}
