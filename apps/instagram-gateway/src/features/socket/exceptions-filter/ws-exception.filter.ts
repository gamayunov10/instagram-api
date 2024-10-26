import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch(WsException)
export class WsExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: WsException, host: ArgumentsHost) {
    // Получаем контекст WebSocket
    const ctx = host.switchToWs();

    // Получаем клиента сокета
    const client: Socket = ctx.getClient();

    // Получаем сообщение об ошибке из исключения
    const errorResponse = {
      type: exception.name,
      timestamp: new Date().toISOString(),
      message: exception.getError(),
    };

    // Отправляем сообщение об ошибке клиенту
    client.emit('error', errorResponse);
    this.logger.error('WebSocket Exception:', JSON.stringify(errorResponse));
  }
}
