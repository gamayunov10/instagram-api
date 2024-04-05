import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as process from 'process';
import { config } from 'dotenv';

config();

import { SendRegistrationMailUseCase } from './application/use-cases/send-registration-mail.use-case';
import { SendPasswordRecoveryUseCase } from './application/use-cases/send-pass-recovery-mail.use-case';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        port: 465,
        host: 'smtp.gmail.com',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS,
        },
        secure: true,
        authMethod: 'PLAIN',
      },
      defaults: {
        from: '"Sir Alex" <process.env.EMAIL>',
      },
      template: {
        dir: join(__dirname, './features/mail/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [SendRegistrationMailUseCase, SendPasswordRecoveryUseCase],
})
export class MailModule {}
