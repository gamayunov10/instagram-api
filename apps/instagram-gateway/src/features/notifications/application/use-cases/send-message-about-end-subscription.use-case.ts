import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../../base/enums/node-env.enum';

export class SendMessageAboutEndSubscriptionCommand {
  constructor(
    public username: string,
    public email: string,
    public endDateOfSubscription: Date,
  ) {}
}

@CommandHandler(SendMessageAboutEndSubscriptionCommand)
export class SendMessageAboutEndSubscriptionUseCase
  implements ICommandHandler<SendMessageAboutEndSubscriptionCommand>
{
  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  async execute(
    command: SendMessageAboutEndSubscriptionCommand,
  ): Promise<void> {
    if (this.configService.get('ENV') !== NodeEnv.TESTING) {
      await this.mailerService.sendMail({
        to: command.email,
        subject: 'Subscription',
        html: `<h1>Congratulations, ${command.username}!</h1>
               <p>Your subscription expired on ${command.endDateOfSubscription}. Please renew your subscription.!</p>
               <p> The subscription has expired. To renew your subscription, change your account type to business <p>
            `,
        context: {
          login: command.username,
        },
      });
    }
  }
}
