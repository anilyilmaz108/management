import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entity/post.entity';
import { User } from '../user/entity/user.entity';
import { RedisService } from 'src/common/redis/redis.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { RedisKeys } from 'src/common/redis/redis-keys.helper';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const ttlDefault = this.configService.get<number>('cache.ttlDefault');

    const user = await this.userRepository.findOneBy({ id: createPostDto.userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = this.postRepository.create({
      title: createPostDto.title,
      content: createPostDto.content,
      user,
    });

    const savedPost = await this.postRepository.save(post);

    // Cache key’leri merkezi RedisKeys yapısından al
    const postKey = RedisKeys.post.byId(savedPost.id);
    const postListKey = RedisKeys.post.all();

    await this.redisService.set(postKey, savedPost, ttlDefault);
    await this.redisService.del(postListKey); // liste cache’ini temizle

    return savedPost;
  }

  async getAll(useCache = true) {
    const cacheKey = RedisKeys.post.all();
    const ttlDefault = this.configService.get<number>('cache.ttlDefault');

    if (useCache) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return cached;
    }

    const posts = await this.postRepository.find({ relations: ['comments'] });

    if (useCache) {
      await this.redisService.set(cacheKey, posts, ttlDefault);
    }

    return posts;
  }

  async getPostsByUserId(userId: number, useCache = true) {
    const cacheKey = `${RedisKeys.post.byId(`user:${userId}`)}`;
    const ttlDefault = this.configService.get<number>('cache.ttlDefault');

    if (useCache) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return cached;
    }

    const posts = await this.postRepository.find({
      where: { user: { id: userId } },
      relations: ['comments'],
    });

    if (!posts || posts.length === 0) {
      throw new NotFoundException(`Posts for user ${userId} not found`);
    }

    if (useCache) {
      await this.redisService.set(cacheKey, posts, ttlDefault);
    }

    return posts;
  }

  async update(id: number, updateData: Partial<CreatePostDto>) {
    const ttlDefault = this.configService.get<number>('cache.ttlDefault');

    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'comments'],
    });

    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    Object.assign(post, updateData);
    const updatedPost = await this.postRepository.save(post);

    const postKey = RedisKeys.post.byId(id);
    const postListKey = RedisKeys.post.all();

    await this.redisService.set(postKey, updatedPost, ttlDefault);
    await this.redisService.del(postListKey); // liste cache’ini temizle

    return updatedPost;
  }

  async remove(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'comments'],
    });

    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }

    await this.postRepository.delete(id);

    const postKey = RedisKeys.post.byId(id);
    const postListKey = RedisKeys.post.all();

    await this.redisService.del(postKey);
    await this.redisService.del(postListKey);

    return { message: `Post with id ${id} deleted` };
  }

  async search(term: string) {
    return this.postRepository
      .createQueryBuilder('post')
      .where(`post.title LIKE :term OR post.content LIKE :term`, { term: `%${term}%` })
      .getMany();
  }
}
