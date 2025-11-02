// chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/modules/user/entity/user.entity';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) throw new Error('Token missing');

      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      const decoded = this.jwtService.verify(cleanToken);

      client.data.user = decoded;

      console.log(`Client connected: ${client.id}`, client.data.user);

      // Birebir mesajlar için default oda join
      // Bu şekilde client kendi id odasına katılır
      const room = `user-${decoded.sub}`;
      client.join(room);
    } catch (err) {
      console.error('Unauthorized socket connection:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() dto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const sender = client.data.user as User;
    if (!sender) throw new Error('Unauthorized sender');

    // Mesaj kaydet
    const message = await this.chatService.saveMessage(dto, sender);

    // Kaydedilen mesajı sender & receiver ile birlikte al
    const fullMessage = await this.chatService.getMessageById(message.id);

    // Mesajı sadece alıcının odasına gönder
    const receiverRoom = `user-${message.receiver!.id}`;
    this.server.to(receiverRoom).emit('newMessage', fullMessage);

    return fullMessage;
  }
}
