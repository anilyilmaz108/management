import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @Get('all/:cache')
  async getAllComments(@Param('cache') cache: string) {
    const useCache = cache === 'true';
    return this.commentService.getAll(useCache);
  }

  @Get(':postId/:cache')
  async getPostsByUserId(
    @Param('postId') postId: number,
    @Param('cache') cache: string,
  ) {
    const useCache = cache === 'true';
    return this.commentService.getCommentsByPostId(postId, useCache);
  }

  @Patch('update/:id')
  async updatePost(
    @Param('id') id: number,
    @Body() updateData: Partial<CreateCommentDto>,
  ) {
    return this.commentService.update(id, updateData);
  }

  @Delete('delete/:id')
  async deletePost(@Param('id') id: number) {
    return this.commentService.remove(id);
  }
}
