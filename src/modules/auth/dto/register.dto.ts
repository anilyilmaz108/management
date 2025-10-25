import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Username', example: 'anilyilmaz' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'User email address', example: 'anil@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (min 6 characters)', example: '123QWe123..' })
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,])[A-Za-z\d@$!%*?&.,]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.',
    },
  )
  password: string;
}
