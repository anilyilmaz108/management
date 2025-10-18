import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  comment: string;

  @IsNotEmpty()
  postId: number;
}
