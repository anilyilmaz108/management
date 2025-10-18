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
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get('all/:cache')
  async getAllPosts(@Param('cache') cache: string) {
    const useCache = cache === 'true';
    return this.postService.getAll(useCache);
  }

  @Get(':userId/:cache')
  async getPostsByUserId(
    @Param('userId') userId: number,
    @Param('cache') cache: string,
  ) {
    const useCache = cache === 'true';
    return this.postService.getPostsByUserId(userId, useCache);
  }

  @Patch('update/:id')
  async updatePost(
    @Param('id') id: number,
    @Body() updateData: Partial<CreatePostDto>,
  ) {
    return this.postService.update(id, updateData);
  }

  @Delete('delete/:id')
  async deletePost(@Param('id') id: number) {
    return this.postService.remove(id);
  }
}
