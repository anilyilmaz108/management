import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post successfully created.' })
  @ApiBody({ type: CreatePostDto })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get('all/:cache')
  @ApiOperation({ summary: 'Get all posts (with optional cache)' })
  @ApiParam({ name: 'cache', description: 'Set true to use cache', required: true })
  getAllPosts(@Param('cache') cache: string) {
    const useCache = cache === 'true';
    return this.postService.getAll(useCache);
  }

  @Get(':userId/:cache')
  @ApiOperation({ summary: 'Get posts by userId (with optional cache)' })
  @ApiParam({ name: 'userId', description: 'User ID', required: true })
  @ApiParam({ name: 'cache', description: 'Set true to use cache', required: true })
  getPostsByUserId(@Param('userId') userId: number, @Param('cache') cache: string) {
    const useCache = cache === 'true';
    return this.postService.getPostsByUserId(userId, useCache);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update a post by ID' })
  @ApiBody({ type: CreatePostDto })
  updatePost(@Param('id') id: number, @Body() updateData: Partial<CreatePostDto>) {
    return this.postService.update(id, updateData);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a post by ID' })
  deletePost(@Param('id') id: number) {
    return this.postService.remove(id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search posts by term in title or content' })
  @ApiQuery({ name: 'term', description: 'Search term', required: true })
  search(@Query('term') term: string) {
    // http://localhost:5001/post/search?term=Test
    return this.postService.search(term);
  }
}
