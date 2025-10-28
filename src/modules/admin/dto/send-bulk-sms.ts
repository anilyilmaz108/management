import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendBulkSmsDto {
  @ApiProperty({ example: 'Campaign SMS text' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Use cached user list if available', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  useCache?: boolean = true;

  @ApiProperty({ description: 'If set, limit number of targets for testing', required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({ description: 'If true, use random phone numbers instead of users phone fields', required: false })
  @IsOptional()
  @IsBoolean()
  useRandomPhone?: boolean = false;
}
