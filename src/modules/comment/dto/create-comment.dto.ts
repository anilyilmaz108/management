import { IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment text' })
  @IsNotEmpty()
  comment: string;

  @ApiProperty({ description: 'ID of the post this comment belongs to' })
  @IsInt()
  @IsNotEmpty()
  postId: number;
}
