import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

import { NodeEnv } from '../../../../base/enums/node-env.enum';

export class SendRegistrationMailCommand {
  constructor(
    public username: string,
    public email: string,
    public confirmationCode: string,
  ) {}
}

@CommandHandler(SendRegistrationMailCommand)
export class SendRegistrationMailUseCase
  implements ICommandHandler<SendRegistrationMailCommand>
{
  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}
  async execute(command: SendRegistrationMailCommand): Promise<void> {
    if (this.configService.get('ENV') !== NodeEnv.TESTING) {
      const url = `${this.configService.get('PUBLIC_FRONT_URL')}/auth/confirm-email?code=${command.confirmationCode}&email=${command.email}`;

      await this.mailerService.sendMail({
        to: command.email,
        subject: 'Registration confirmation',
        html: `<h1>Hello, ${command.username}! Thank you for registration</h1>
              <p>Follow the link below to complete your registration, or simply ignore it if you find it suspicious:
                <a href="${url}">Complete your registration</a>
              </p>
            `,
        context: {
          login: command.username,
          url,
        },
      });
    }
  }
}
