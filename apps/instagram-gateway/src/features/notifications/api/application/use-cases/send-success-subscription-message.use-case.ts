import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../../../base/enums/node-env.enum';

export class SendSuccessSubscriptionCommand {
  constructor(
    public username: string,
    public email: string,
  ) {}
}

@CommandHandler(SendSuccessSubscriptionCommand)
export class SendSuccessSubscriptionUseCase
  implements ICommandHandler<SendSuccessSubscriptionCommand>
{
  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  async execute(command: SendSuccessSubscriptionCommand): Promise<void> {
    if (this.configService.get('ENV') !== NodeEnv.TESTING) {
      await this.mailerService.sendMail({
        to: command.email,
        subject: 'Subscription',
        html: `<h1>Congratulations, ${command.username}!</h1>
               <p>You have switched to a business account!</p>
            `,
        context: {
          login: command.username,
        },
      });
    }
  }
}
