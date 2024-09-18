import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { SendPasswordRecoveryMailCommand } from '../../../../../notifications/api/application/use-cases/send-pass-recovery-mail.use-case';
import { NodeEnv } from '../../../../../../base/enums/node-env.enum';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import {
  emailField,
  emailNotExist,
} from '../../../../../../base/constants/constants';
import { ExceptionResultType } from '../../../../../../base/types/exception.type';
import { UserDevicesRepository } from '../../../../../users/infrastructure/devices/user.devices.repo';
import { UsersRepository } from '../../../../../users/infrastructure/users.repo';
import { UsersQueryRepository } from '../../../../../users/infrastructure/users.query.repo';
import { EmailInputModel } from '../../../../models/input/email-input.model';

export class PasswordRecoveryResendingCommand {
  constructor(public userInputModel: EmailInputModel) {}
}

@CommandHandler(PasswordRecoveryResendingCommand)
export class PasswordRecoveryResendingUseCase
  implements ICommandHandler<PasswordRecoveryResendingCommand>
{
  private readonly logger = new Logger(PasswordRecoveryResendingUseCase.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly userDevicesRepository: UserDevicesRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    command: PasswordRecoveryResendingCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const user = await this.usersQueryRepository.findUserByEmail(
      command.userInputModel.email,
    );

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: emailField,
        message: emailNotExist,
      };
    }

    const recoveryCode = randomUUID();

    await this.usersRepository.updatePasswordRecoveryRecord(
      user.id,
      recoveryCode,
    );

    try {
      await this.commandBus.execute(
        new SendPasswordRecoveryMailCommand(
          user.username,
          user.email,
          recoveryCode,
        ),
      );
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    }

    await this.userDevicesRepository.deleteUserSessions(user.id);

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
