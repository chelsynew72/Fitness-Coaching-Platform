import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // track connected users: userId -> socketId
  private connectedUsers = new Map<string, string>();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // called when a client connects
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token as string;

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // attach user info to socket
      client.data.userId = payload.sub;
      client.data.role = payload.role;

      // track the connection
      this.connectedUsers.set(payload.sub, client.id);

      // join personal room so we can send direct messages
      client.join(`user_${payload.sub}`);

      console.log(`User ${payload.sub} connected via WebSocket`);
    } catch {
      client.disconnect();
    }
  }

  // called when a client disconnects
  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.connectedUsers.delete(client.data.userId);
      console.log(`User ${client.data.userId} disconnected`);
    }
  }

  // client sends a message
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { receiverId: string; content: string; type?: string },
  ) {
    const senderId = client.data.userId;
    if (!senderId) return;

    // save to database
    const message = await this.chatService.saveMessage(
      senderId,
      data.receiverId,
      data.content,
      data.type || 'text',
    );

    const populatedMessage = await message.populate([
      { path: 'senderId', select: 'name avatar' },
      { path: 'receiverId', select: 'name avatar' },
    ]);

    // emit to receiver's personal room
    this.server
      .to(`user_${data.receiverId}`)
      .emit('newMessage', populatedMessage);

    // emit back to sender to confirm
    this.server
      .to(`user_${senderId}`)
      .emit('newMessage', populatedMessage);

    return populatedMessage;
  }

  // mark messages as read
  @SubscribeMessage('markRead')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    await this.chatService.markAsRead(data.conversationId, userId);

    // notify the other user their messages were read
    this.server
      .to(`user_${userId}`)
      .emit('messagesRead', { conversationId: data.conversationId });
  }

  // typing indicator
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; isTyping: boolean },
  ) {
    const senderId = client.data.userId;
    if (!senderId) return;

    this.server.to(`user_${data.receiverId}`).emit('userTyping', {
      userId: senderId,
      isTyping: data.isTyping,
    });
  }
}