import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersModule } from '../users/users.module';

import { SocketGatewayService } from './socket.gateway.service';

@Module({
  imports: [UsersModule],
  controllers: [],
  exports: [],
  providers: [SocketGatewayService, JwtService],
})
export class SocketGatewayModule {}
