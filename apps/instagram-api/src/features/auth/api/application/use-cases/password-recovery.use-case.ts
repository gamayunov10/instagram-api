import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { UserEmailInputModel } from '../../../models/input/user-email.input.model';
import { UsersRepository } from '../../../../user/infrastructure/users.repo';
import { UsersQueryRepository } from '../../../../user/infrastructure/users.query.repo';
import { SendPasswordRecoveryMailCommand } from '../../../../mail/application/use-cases/send-pass-recovery-mail.use-case';
import { NodeEnv } from '../../../../../base/enums/node-env.enum';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import {
  emailField,
  emailNotExist,
} from '../../../../../base/constants/constants';
import { ExceptionResultType } from '../../../../../base/types/exception.type';

export class PasswordRecoveryCommand {
  constructor(public userEmailInputModel: UserEmailInputModel) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  private readonly logger = new Logger(PasswordRecoveryUseCase.name);

  constructor(
    private commandBus: CommandBus,
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    command: PasswordRecoveryCommand,
  ): Promise<ExceptionResultType<boolean>> {
    const user = await this.usersQueryRepository.findUserByEmail(
      command.userEmailInputModel.email,
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

    const result = await this.usersRepository.createPasswordRecoveryRecord(
      user.id,
      recoveryCode,
    );

    if (!result) {
      await this.usersRepository.createPasswordRecoveryRecord(
        user.id,
        recoveryCode,
      );
    }

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

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
