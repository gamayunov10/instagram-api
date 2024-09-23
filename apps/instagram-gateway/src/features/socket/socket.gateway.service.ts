import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UsersQueryRepository } from '../users/infrastructure/users.query.repo';
import { corsWhiteList } from '../../settings/app.settings';
import { notificationEvent } from '../../base/constants/constants';
import { NotificationViewModel } from '../notifications/models/notification.view.model';

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
    private readonly configService: ConfigService,
  ) {}

  private clients: Map<Socket, string> = new Map();

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.accesstoken as string;

      if (!token) {
        this.forceDisconnect(client, 'Missing token');
        return;
      }

      const decodedToken = this.jwtService.verify(token, {
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      });

      const user = await this.usersQueryRepo.findUserById(decodedToken.userId);

      if (!user) {
        this.forceDisconnect(client, 'Unauthorized');
        return;
      }

      client.data.user = user.id;

      this.clients.set(client, user.id);

      client.join(user.id);
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

  sendNotificationToUser(userId: string, notification: NotificationViewModel) {
    this.server.to(userId).emit(notificationEvent, notification);
  }
}
