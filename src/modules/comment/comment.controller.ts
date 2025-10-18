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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Comment } from './entity/comment.entity';

@ApiTags('Comments')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'Comment successfully created.', type: Comment })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateCommentDto })
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @Get('all/:cache')
  @ApiOperation({ summary: 'Get all comments with optional cache' })
  @ApiResponse({ status: 200, description: 'List of comments.', type: [Comment] })
  async getAllComments(@Param('cache') cache: string) {
    const useCache = cache === 'true';
    return this.commentService.getAll(useCache);
  }

  @Get('post/:postId/:cache')
  @ApiOperation({ summary: 'Get comments by post ID with optional cache' })
  @ApiResponse({ status: 200, description: 'List of comments for a post.', type: [Comment] })
  async getCommentsByPostId(
    @Param('postId') postId: number,
    @Param('cache') cache: string,
  ) {
    const useCache = cache === 'true';
    return this.commentService.getCommentsByPostId(postId, useCache);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a comment by ID' })
  @ApiResponse({ status: 200, description: 'Comment successfully updated.', type: Comment })
  @ApiBody({ type: CreateCommentDto })
  async updateComment(
    @Param('id') id: number,
    @Body() updateData: Partial<CreateCommentDto>,
  ) {
    return this.commentService.update(id, updateData);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a comment by ID' })
  @ApiResponse({ status: 200, description: 'Comment successfully deleted.' })
  async deleteComment(@Param('id') id: number) {
    return this.commentService.remove(id);
  }
}
