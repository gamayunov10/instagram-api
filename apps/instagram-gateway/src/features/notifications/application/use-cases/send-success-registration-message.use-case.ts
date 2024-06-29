import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../../base/enums/node-env.enum';

export class SendSuccessRegistrationCommand {
  constructor(
    public username: string,
    public email: string,
  ) {}
}

@CommandHandler(SendSuccessRegistrationCommand)
export class SendSuccessRegistrationUseCase
  implements ICommandHandler<SendSuccessRegistrationCommand>
{
  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  async execute(command: SendSuccessRegistrationCommand): Promise<void> {
    if (this.configService.get('ENV') !== NodeEnv.TESTING) {
      await this.mailerService.sendMail({
        to: command.email,
        subject: 'Registration',
        html: `<h1>Congratulations, ${command.username}!</h1>
               <p>Your account confirmed!</p>
            `,
        context: {
          login: command.username,
        },
      });
    }
  }
}
