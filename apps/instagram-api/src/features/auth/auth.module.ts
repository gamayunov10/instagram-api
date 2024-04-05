import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaClient } from '@prisma/client';

import { UsersRepository } from '../user/infrastructure/users.repo';
import { UsersQueryRepository } from '../user/infrastructure/users.query.repo';
import { IsEmailAlreadyExistConstraint } from '../../infrastructure/decorators/unique-email.decorator';
import { IsUsernameAlreadyExistConstraint } from '../../infrastructure/decorators/unique-username.decorator';

import { AuthService } from './api/application/auth.service';
import { AuthController } from './api/auth.controller';
import { RegistrationUseCase } from './api/application/use-cases/registration.use-case';
import { RegistrationConfirmationUseCase } from './api/application/use-cases/registration-confirmation.use-case';
import { PasswordRecoveryUseCase } from './api/application/use-cases/password-recovery.use-case';
import { LoginInTheSystemUseCase } from './api/application/use-cases/login-in-the-system.use-case';

const services = [AuthService, PrismaClient];
const useCases = [
  RegistrationUseCase,
  RegistrationConfirmationUseCase,
  PasswordRecoveryUseCase,
  LoginInTheSystemUseCase
];
const repositories = [UsersRepository];
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
