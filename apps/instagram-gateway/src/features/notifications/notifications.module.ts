import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SendRegistrationMailUseCase } from './application/use-cases/send-registration-mail.use-case';
import { SendPasswordRecoveryUseCase } from './application/use-cases/send-pass-recovery-mail.use-case';
import { SendSuccessSubscriptionUseCase } from './application/use-cases/send-success-subscription-message.use-case';
import { SendSuccessRegistrationUseCase } from './application/use-cases/send-success-registration-message.use-case';
import { SendSuccessAutoRenewalSubscriptionUseCase } from './application/use-cases/send-success-auto-renewal-message.use-case';
import { SendMessageAboutEndSubscriptionUseCase } from './application/use-cases/send-message-about-end-subscription.use-case';

const useCases = [
  SendRegistrationMailUseCase,
  SendPasswordRecoveryUseCase,
  SendSuccessSubscriptionUseCase,
  SendSuccessRegistrationUseCase,
  SendSuccessAutoRenewalSubscriptionUseCase,
  SendMessageAboutEndSubscriptionUseCase,
];
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          port: 465,
          host: 'smtp.gmail.com',
          auth: {
            user: configService.get<string>('EMAIL'),
            pass: configService.get<string>('EMAIL_PASS'),
          },
          secure: true,
        },
        defaults: {
          from: `"Warriors" <${configService.get<string>('EMAIL')}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [...useCases],
})
export class NotificationsModule {}
