import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter extends BaseExceptionFilter {
  catch(exception: WsException, host: ArgumentsHost) {
    const ctx = host.switchToWs();

    const client: Socket = ctx.getClient();

    client.emit('error', {
      type: exception.name,
      timestamp: new Date().toISOString(),
      message: exception.getError(),
    });
  }
}
