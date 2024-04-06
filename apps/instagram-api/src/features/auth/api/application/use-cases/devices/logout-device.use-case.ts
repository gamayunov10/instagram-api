import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

import { UserDevicesRepository } from '../../../../../user/infrastructure/user.devices.repo';

export class LogoutDeviceCommand {
  constructor(public token: string) {}
}

@CommandHandler(LogoutDeviceCommand)
export class LogoutDeviceUseCase
  implements ICommandHandler<LogoutDeviceCommand>
{
  constructor(
    private readonly userDevicesRepository: UserDevicesRepository,
    private readonly jwtService: JwtService,
  ) {}
  async execute(command: LogoutDeviceCommand): Promise<boolean> {
    const decodedToken = await this.jwtService.decode(command.token);

    return this.userDevicesRepository.deleteUserDeviceId(
      decodedToken.userId,
      decodedToken.deviceId
    );
  }
}
