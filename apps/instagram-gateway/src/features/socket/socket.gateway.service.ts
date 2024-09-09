import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersQueryRepository } from '../users/infrastructure/users.query.repo';

const corsWhiteList = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:3439',
  'https://inctagram.org',
];
@WebSocketGateway({
  cors: {
    origin: corsWhiteList,
  },
})
@Injectable()
export class SocketGatewayService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly usersQueryRepo: UsersQueryRepository,
    private readonly jwtService: JwtService,
  ) {}

  private clients: Map<Socket, string> = new Map();

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.accesstoken as string;

      if (!token) {
        this.forceDisconnect(client, 'Missing token');
        return;
      }

      const decodedToken = this.jwtService.decode(token);
      const user = await this.usersQueryRepo.findUserById(decodedToken.userId);
      if (!user) {
        this.forceDisconnect(client, 'Unauthorized');
        return;
      }
      client.data.user = user.id;
      this.clients.set(client, user.id);
    } catch (e) {
      this.forceDisconnect(client, 'Unauthorized');
      return;
    }
  }

  handleDisconnect(client: Socket): void {
    for (const [savedClient, userId] of this.clients) {
      if (savedClient === client) {
        this.clients.delete(savedClient);
      }
    }
  }
  forceDisconnect(client: Socket, message: string) {
    client.emit('error', new WsException(message));
    client.disconnect(true);
  }

  @SubscribeMessage('get_notifications')
  async handleGetNotifications(client: Socket) {
    const userId = client.data.user;
    const notifications =
      'await this.notificationsService.getNotifications(userId)';
    client.emit('notifications', notifications); // Отправляем уведомления пользователю
  }
}
