// chat.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageEntity } from './entity/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async saveMessage(dto: SendMessageDto, sender: any) {
    if (!dto.content) throw new Error('Message content missing');
    if (!dto.receiverId) throw new Error('ReceiverId missing');

    const receiver = await this.userRepo.findOne({
      where: { id: dto.receiverId },
    });
    if (!receiver) throw new NotFoundException('Receiver not found');

    const senderEntity = await this.userRepo.findOne({
      where: { id: sender.sub },
    });
    if (!senderEntity) throw new NotFoundException('Sender not found');

    const room = `${senderEntity.id}-${receiver.id}`;
    const message = this.messageRepo.create({
      content: dto.content,
      room,
      sender: senderEntity,
      receiver,
    });

    return await this.messageRepo.save(message); // sadece bir kez kaydedilir
  }

  async getMessages(room: string) {
    return this.messageRepo.find({
      where: { room },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'ASC' },
    });
  }

  async getMessageById(id: number) {
    return this.messageRepo.findOne({
      where: { id },
      relations: ['sender', 'receiver'], // sender & receiver bilgilerini al
    });
  }
}
