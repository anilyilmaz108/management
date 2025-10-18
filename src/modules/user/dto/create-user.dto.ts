import { IsString, IsEmail, IsInt, IsBoolean, Min, Max, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(0)
  age: number;

  @IsInt()
  role: number;

  @IsOptional()
  @IsInt()
  tempRole?: number; // opsiyonel, geçici rol

  @IsBoolean()
  isActive: boolean;
}
