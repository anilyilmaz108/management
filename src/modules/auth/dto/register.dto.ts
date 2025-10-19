import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Username', example: 'anilyilmaz' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'User email address', example: 'anil@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (min 6 characters)', example: '123qwe123' })
  @IsString()
  @MinLength(6)
  password: string;
}
