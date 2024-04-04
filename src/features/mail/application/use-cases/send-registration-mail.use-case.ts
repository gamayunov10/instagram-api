import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

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
    const url = `${this.configService.get('PUBLIC_FRONT_URL')}/confirm-email?code=${command.confirmationCode}`;

    await this.mailerService.sendMail({
      to: command.email,
      subject: 'Registration confirmation',
      template: './confirmation',
      context: {
        login: command.username,
        url,
      },
    });
  }
}
