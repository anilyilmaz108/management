import {
  IsString,
  IsEmail,
  IsInt,
  IsBoolean,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Post } from 'src/modules/post/entity/post.entity';

export class GetUserDto {
  @ApiProperty({ example: 'anil.yilmaz', description: 'Username of the user' })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'anil@example.com',
    description: 'Email of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 27, description: 'Age of the user' })
  @IsInt()
  @Min(0)
  age: number;

  @ApiProperty({
    example: 1,
    description: 'Role of the user: 1=Yönetici, 2=Çalışan, 3=Müşteri, 4=Admin',
  })
  @IsInt()
  role: number;

  @ApiProperty({ example: true, description: 'Is user active?' })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({
    type: [Post],
    description: 'Posts of the user (optional)',
  })
  @IsOptional()
  posts?: Post[];
}
