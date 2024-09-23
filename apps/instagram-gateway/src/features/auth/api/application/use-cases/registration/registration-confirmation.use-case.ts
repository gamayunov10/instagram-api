import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { UserConfirmationCodeInputModel } from '../../../../models/input/user-confirmation-code.input.model';
import { UsersRepository } from '../../../../../users/infrastructure/users.repo';
import { UsersQueryRepository } from '../../../../../users/infrastructure/users.query.repo';
import { NodeEnv } from '../../../../../../base/enums/node-env.enum';
import { SendSuccessRegistrationCommand } from '../../../../../notifications/api/application/use-cases/send-success-registration-message.use-case';

export class RegistrationConfirmationCommand {
  constructor(
    public userConfirmationCodeInputModel: UserConfirmationCodeInputModel,
  ) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase
  implements ICommandHandler<RegistrationConfirmationCommand>
{
  private readonly logger = new Logger(RegistrationConfirmationUseCase.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: RegistrationConfirmationCommand): Promise<boolean> {
    const user =
      await this.usersQueryRepository.findUserByEmailConfirmationCode(
        command.userConfirmationCodeInputModel.code,
      );

    if (
      !user ||
      user?.isConfirmed ||
      user?.confirmationCode.expirationDate < new Date()
    ) {
      return false;
    }

    const result = await this.usersRepository.confirmUser(user.id);

    if (result) {
      try {
        await this.commandBus.execute(
          new SendSuccessRegistrationCommand(user.username, user.email),
        );
      } catch (e) {
        if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
          this.logger.error(e);
        }
        return null;
      }
    }

    return result;
  }
}
