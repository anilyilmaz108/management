import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendBulkMailDto {
  @ApiProperty({ example: 'Campaign title' })
  @IsString()
  subject: string;

  @ApiProperty({ example: '<p>Hello users</p>' })
  @IsString()
  message: string;

  @ApiProperty({ description: 'Use cached emails if available', required: false, default: true })
  @IsOptional()
  @IsBoolean()
  useCache?: boolean = true;

  @ApiProperty({ description: 'If set, limit the number of target users (for testing)', required: false })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
