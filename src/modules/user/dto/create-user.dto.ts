import { IsString, IsEmail, IsInt, IsBoolean, Min, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'anil.yilmaz', description: 'Username of the user' })
  @IsString()
  username: string;

  @ApiProperty({ example: '123QWee..', description: 'Password of the user' })
  @IsString()
  @Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,])[A-Za-z\d@$!%*?&.,]{8,}$/,
      {
        message:
          'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.',
      },
    )
  password: string;

  @ApiProperty({ example: 'anil@example.com', description: 'Email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 27, description: 'Age of the user' })
  @IsInt()
  @Min(0)
  age: number;

  @ApiProperty({ example: 1, description: 'Role of the user: 1=Yönetici, 2=Çalışan, 3=Müşteri, 4=Admin' })
  @IsInt()
  role: number;

  @ApiPropertyOptional({ example: 2, description: 'Optional temporary role' })
  @IsOptional()
  @IsInt()
  tempRole?: number;

  @ApiProperty({ example: true, description: 'Is user active?' })
  @IsBoolean()
  isActive: boolean;
}
