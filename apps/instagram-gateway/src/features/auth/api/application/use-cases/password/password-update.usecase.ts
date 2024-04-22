import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';

import { NewPasswordModel } from '../../../../models/input/new-password.model';
import { UsersRepository } from '../../../../../user/infrastructure/users.repo';
import { UsersQueryRepository } from '../../../../../user/infrastructure/users.query.repo';
import { exceptionHandler } from '../../../../../../infrastructure/exception-filters/exception-handler';
import { ResultCode } from '../../../../../../base/enums/result-code.enum';
import {
  confirmCodeField,
  passwordField,
  passwordNotSaved,
  recoveryCodeIsIncorrect,
} from '../../../../../../base/constants/constants';
import { ExceptionResultType } from '../../../../../../base/types/exception.type';

export class PasswordUpdateCommand {
  constructor(public newPasswordModel: NewPasswordModel) {}
}

@CommandHandler(PasswordUpdateCommand)
export class PasswordUpdateUseCase
  implements ICommandHandler<PasswordUpdateCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(
    command: PasswordUpdateCommand,
  ): Promise<ExceptionResultType<boolean> | void> {
    const user = await this.usersQueryRepository.findPasswordRecoveryRecord(
      command.newPasswordModel.recoveryCode,
    );

    if (!user || user?.expirationDate < new Date()) {
      return exceptionHandler(
        ResultCode.BadRequest,
        recoveryCodeIsIncorrect,
        confirmCodeField,
      );
    }

    const hash = await bcrypt.hash(command.newPasswordModel.newPassword, 10);

    const updateResult = await this.usersRepository.updatePassword(
      user.userId,
      hash,
    );

    if (!updateResult) {
      return exceptionHandler(
        ResultCode.InternalServerError,
        passwordNotSaved,
        passwordField,
      );
    }

    return {
      data: true,
      code: ResultCode.Success,
    };
  }
}
