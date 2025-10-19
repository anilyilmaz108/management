import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'User email address', example: 'anil@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password', example: '123qwe123' })
  @IsString()
  password: string;
}
