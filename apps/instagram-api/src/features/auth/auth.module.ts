import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

import { UsersRepository } from '../user/infrastructure/users.repo';
import { UsersQueryRepository } from '../user/infrastructure/users.query.repo';
import { IsEmailAlreadyExistConstraint } from '../../infrastructure/decorators/unique-email.decorator';
import { IsUsernameAlreadyExistConstraint } from '../../infrastructure/decorators/unique-username.decorator';
import { UserDevicesRepository } from '../user/infrastructure/user.devices.repo';

import { AuthService } from './api/application/auth.service';
import { AuthController } from './api/auth.controller';
import { RegistrationUseCase } from './api/application/use-cases/registration.use-case';
import { RegistrationConfirmationUseCase } from './api/application/use-cases/registration-confirmation.use-case';
import { PasswordRecoveryUseCase } from './api/application/use-cases/password-recovery.use-case';
import { LoginUseCase } from './api/application/use-cases/login.use.case';
import { CreateTokensUseCase } from './api/application/use-cases/tokens/create-token.use-case';
import { LoginDeviceUseCase } from './api/application/use-cases/devices/login-device.use-case';

const services = [AuthService, PrismaClient, JwtService];
const useCases = [
  RegistrationUseCase,
  RegistrationConfirmationUseCase,
  PasswordRecoveryUseCase,
  LoginUseCase,
  CreateTokensUseCase,
  LoginDeviceUseCase,
];
const repositories = [UsersRepository, UserDevicesRepository];
const queryRepositories = [UsersQueryRepository];
const constraints = [
  IsEmailAlreadyExistConstraint,
  IsUsernameAlreadyExistConstraint,
];

@Module({
  imports: [CqrsModule],
  controllers: [AuthController],
  providers: [
    ...services,
    ...useCases,
    ...repositories,
    ...queryRepositories,
    ...constraints,
  ],
})
export class AuthModule {}
