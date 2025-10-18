import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entity/post.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entity/user.entity';
import { RedisService } from 'src/common/redis/redis.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const user = await this.userRepository.findOneBy({
      id: createPostDto.userId,
    });
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    const post = this.postRepository.create({
      title: createPostDto.title,
      content: createPostDto.content,
      user,
    });
    const savedPost = this.postRepository.save(post);
    await this.redisService.set(`post:${(await savedPost).id}`, savedPost, 60);

    return savedPost;
  }

  async getAll(useCache = true) {
    const cacheKey = 'posts:all';

    if (useCache) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return cached;
    }

    const posts = await this.postRepository.find({ relations: ['comments'] });
    if (useCache) {
      await this.redisService.set(cacheKey, posts, 60); // 60 saniye cache
    }
    return posts;
  }

  async getPostsByUserId(userId: number, useCache = true) {
    const cacheKey = `post:${userId}`;

    if (useCache) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return cached;
    }

    const post = await this.postRepository.find({
      where: { user: { id: userId } },
      relations: ['comments'],
    });
    if (!post)
      throw new NotFoundException(`Post with userId ${userId} not found`);

    if (useCache) {
      await this.redisService.set(cacheKey, post, 60);
    }

    return post;
  }

  async update(id: number, updateData: Partial<CreatePostDto>) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'comments'],
    });

    if (!post) {
      throw new NotFoundException(
        `Post with id ${id} not found`,
      );
    }

    Object.assign(post, updateData);

    const updatedPost = await this.postRepository.save(post);

    // Cache key kullanıcıya bağlı
    const cacheKey = `post:${id}`;
    await this.redisService.del(cacheKey); // cache'i temizle

    return updatedPost;
  }

  async remove(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'comments'],
    });
    if (!post)
      throw new NotFoundException(
        `Post with id ${id} not found`,
      );

    await this.postRepository.delete(id); // soft delete gerek yok. DBden silelim.
    await this.redisService.del(`post:${id}`);
    await this.redisService.del('posts:all'); // tüm postlar için cache’i sil

    return { message: `Post with id ${id} deleted` };
  }
}
