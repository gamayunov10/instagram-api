import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { EmailInputModel } from '../../../../models/input/email-input.model';
import { UsersRepository } from '../../../../../user/infrastructure/users.repo';
import { UsersQueryRepository } from '../../../../../user/infrastructure/users.query.repo';
import { SendRegistrationMailCommand } from '../../../../../mail/application/use-cases/send-registration-mail.use-case';
import { NodeEnv } from '../../../../../../base/enums/node-env.enum';

export class RegistrationEmailResendCommand {
  constructor(public emailInputModel: EmailInputModel) {}
}

@CommandHandler(RegistrationEmailResendCommand)
export class RegistrationEmailResendUseCase
  implements ICommandHandler<RegistrationEmailResendCommand>
{
  private readonly logger = new Logger(RegistrationEmailResendUseCase.name);

  constructor(
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: RegistrationEmailResendCommand): Promise<boolean> {
    const user = await this.usersQueryRepository.findUserByEmail(
      command.emailInputModel.email,
    );

    if (!user || user.isConfirmed) {
      return null;
    }

    const newConfirmationCode = randomUUID();

    const result = await this.usersRepository.updateEmailConfirmationCode(
      newConfirmationCode,
      user.id,
    );

    try {
      await this.commandBus.execute(
        new SendRegistrationMailCommand(
          user.username,
          user.email,
          newConfirmationCode,
        ),
      );
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
      return null;
    }

    return result;
  }
}
