import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';

export class CreateTokensCommand {
  constructor(public userId: string) {}
}

@CommandHandler(CreateTokensCommand)
export class CreateTokensUseCase
  implements ICommandHandler<CreateTokensCommand>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: CreateTokensCommand) {
    const deviceId = randomUUID();

    const accessTokenPayload: any = { userId: command.userId };

    const refreshTokenPayload: any = {
      userId: command.userId,
      deviceId: deviceId,
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('ACCESS_TOKEN_EXP'),
    });

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXP'),
    });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
