import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export class SendPasswordRecoveryMailCommand {
  constructor(
    public username: string,
    public email: string,
    public recoveryCode: string,
  ) {}
}

@CommandHandler(SendPasswordRecoveryMailCommand)
export class SendPasswordRecoveryUseCase
  implements ICommandHandler<SendPasswordRecoveryMailCommand>
{
  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: SendPasswordRecoveryMailCommand) {
    const url = `${this.configService.get('PUBLIC_FRONT_URL')}/password-recovery?recoveryCode=${command.recoveryCode}`;
    await this.mailerService.sendMail({
      to: command.email,
      subject: 'Password recovery',
      html: `<h1>Hello, ${command.username}!</h1>
              <p>To recover your password please follow the link below, or simply ignore it if you find it suspicious:
                <a href="${url}">Click here to reset your password</a>
              </p>
            `,
      context: {
        login: command.username,
        url,
      },
    });
  }
}
