import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsServiceAdapter {
  logger = new Logger(PaymentsServiceAdapter.name);

  constructor(
    @Inject('PAYMENTS_SERVICE')
    private readonly paymentsServiceClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}
}
