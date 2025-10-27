import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entity/comment.entity';
import { Post } from '../post/entity/post.entity';
import { RedisService } from 'src/common/redis/redis.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { RedisKeys } from 'src/common/redis/redis-keys.helper';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const ttlDefault = this.configService.get<number>('cache.ttlDefault');

    const post = await this.postRepository.findOneBy({ id: createCommentDto.postId });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = this.commentRepository.create({
      comment: createCommentDto.comment,
      post,
    });

    const savedComment = await this.commentRepository.save(comment);

    const commentKey = RedisKeys.comment.byId(savedComment.id);
    const commentListKey = RedisKeys.comment.all();

    await this.redisService.set(commentKey, savedComment, ttlDefault);
    await this.redisService.del(commentListKey); // liste cache’ini temizle

    return savedComment;
  }

  async getAll(useCache = true) {
    const cacheKey = RedisKeys.comment.all();
    const ttlDefault = this.configService.get<number>('cache.ttlDefault');

    if (useCache) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return cached;
    }

    const comments = await this.commentRepository.find({ relations: ['post'] });

    if (useCache) {
      await this.redisService.set(cacheKey, comments, ttlDefault);
    }

    return comments;
  }

  async getCommentsByPostId(postId: number, useCache = true) {
    const cacheKey = RedisKeys.comment.byPost(postId);
    const ttlDefault = this.configService.get<number>('cache.ttlDefault');

    if (useCache) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return cached;
    }

    const comments = await this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['post'],
    });

    if (!comments || comments.length === 0) {
      throw new NotFoundException(`Comments for postId ${postId} not found`);
    }

    if (useCache) {
      await this.redisService.set(cacheKey, comments, ttlDefault);
    }

    return comments;
  }

  async update(id: number, updateData: Partial<CreateCommentDto>) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['post'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    Object.assign(comment, updateData);
    const updatedComment = await this.commentRepository.save(comment);

    const commentKey = RedisKeys.comment.byId(id);
    const commentListKey = RedisKeys.comment.all();

    await this.redisService.set(commentKey, updatedComment, this.configService.get<number>('cache.ttlDefault'));
    await this.redisService.del(commentListKey); // liste cache’ini temizle

    return updatedComment;
  }

  async remove(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['post'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }

    await this.commentRepository.delete(id);

    const commentKey = RedisKeys.comment.byId(id);
    const commentListKey = RedisKeys.comment.all();

    await this.redisService.del(commentKey);
    await this.redisService.del(commentListKey);

    return { message: `Comment with id ${id} deleted` };
  }
}
