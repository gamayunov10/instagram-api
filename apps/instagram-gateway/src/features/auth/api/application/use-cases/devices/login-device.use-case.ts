import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserDevicesRepository } from '../../../../../users/infrastructure/devices/user.devices.repo';
import { SendSuccessRegistrationCommand } from '../../../../../notifications/application/use-cases/send-success-registration-message.use-case';
import { NodeEnv } from '../../../../../../base/enums/node-env.enum';

export class LoginDeviceCommand {
  constructor(
    public token: string,
    public ip: string,
    public userAgent: string,
    public username?: string,
    public email?: string,
  ) {}
}

@CommandHandler(LoginDeviceCommand)
export class LoginDeviceUseCase implements ICommandHandler<LoginDeviceCommand> {
  private readonly logger = new Logger(LoginDeviceUseCase.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly userDevicesRepository: UserDevicesRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: LoginDeviceCommand): Promise<string> {
    const decodedToken = await this.jwtService.decode(command.token);

    const result = await this.userDevicesRepository.createDevice(
      decodedToken,
      command.ip,
      command.userAgent,
    );

    if (result && command?.username && command?.email) {
      try {
        await this.commandBus.execute(
          new SendSuccessRegistrationCommand(command.username, command.email),
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
