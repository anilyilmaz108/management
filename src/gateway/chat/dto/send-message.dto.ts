import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  receiverId?: number; // bire bir mesajlaşma için

  @IsOptional()
  @IsString()
  room?: string; // grup mesajlaşması için
}
