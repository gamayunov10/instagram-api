import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../../../base/enums/node-env.enum';

export class SendSuccessAutoRenewalSubscriptionCommand {
  constructor(
    public username: string,
    public email: string,
    public interval: string,
  ) {}
}

@CommandHandler(SendSuccessAutoRenewalSubscriptionCommand)
export class SendSuccessAutoRenewalSubscriptionUseCase
  implements ICommandHandler<SendSuccessAutoRenewalSubscriptionCommand>
{
  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  async execute(
    command: SendSuccessAutoRenewalSubscriptionCommand,
  ): Promise<void> {
    if (this.configService.get('ENV') === NodeEnv.TESTING) {
      await this.mailerService.sendMail({
        to: command.email,
        subject: 'Subscription',
        html: `<h1>Congratulations, ${command.username}!</h1>
               <p>We are pleased to inform you that automatic payment for your subscription has been successfully installed!</p>
               <p>The amount will be debited from your card every ${command.interval}.<p>

            `,
        context: {
          login: command.username,
        },
      });
    }
  }
}
