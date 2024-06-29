import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';

export const paymentsServiceConfig = (): ClientsProviderAsyncOptions => {
  return {
    useFactory: (configService: ConfigService) => ({
      transport: Transport.TCP,
      options: {
        host: configService.get('PAY_SERVICE_HOST') || '0.0.0.0',
        port: Number(configService.get('PAY_SERVICE_PORT')) || 3437,
      },
    }),
    inject: [ConfigService],
    imports: [ConfigModule],
    name: 'PAYMENTS_SERVICE',
  };
};
