import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entity/comment.entity';
import { Repository } from 'typeorm';
import { Post } from '../post/entity/post.entity';
import { RedisService } from 'src/common/redis/redis.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private readonly redisService: RedisService,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    const post = await this.postRepository.findOneBy({
      id: createCommentDto.postId,
    });

    if (!post) {
      throw new NotFoundException('Post Not Found');
    }

    const comment = this.commentRepository.create({
      comment: createCommentDto.comment,
      post,
    });

    const savedComment = this.commentRepository.save(comment);
    await this.redisService.set(
      `comment:${(await savedComment).id}`,
      savedComment,
      60,
    );

    return savedComment;
  }

  async getAll(useCache = true) {
    const cacheKey = 'commments:all';

    if (useCache) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return cached;
    }

    const comments = await this.commentRepository.find({ relations: ['post'] });
    if (useCache) {
      await this.redisService.set(cacheKey, comments, 60); // 60 saniye cache
    }
    return comments;
  }

  async getCommentsByPostId(postId: number, useCache = true) {
    const cacheKey = `post:${postId}`;

    if (useCache) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return cached;
    }

    const comments = await this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['post'],
    });
    if (!comments)
      throw new NotFoundException(`Comment with postId ${postId} not found`);

    if (useCache) {
      await this.redisService.set(cacheKey, comments, 60);
    }

    return comments;
  }

  async update(id: number, updateData: Partial<CreateCommentDto>) {
    const commment = await this.commentRepository.findOne({
      where: { id },
      relations: ['post'],
    });

    if (!commment) {
      throw new NotFoundException(`Commment with id ${id} not found`);
    }

    Object.assign(commment, updateData);

    const updatedComment = await this.commentRepository.save(commment);

    // Cache key kullanıcıya bağlı
    const cacheKey = `comment:${id}`;
    await this.redisService.del(cacheKey); // cache'i temizle

    return updatedComment;
  }

  async remove(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['post'],
    });
    if (!comment)
      throw new NotFoundException(`Comment with id ${id} not found`);

    await this.commentRepository.delete(id); // soft delete gerek yok. DBden silelim.
    await this.redisService.del(`comment:${id}`);
    await this.redisService.del('comments:all'); // tüm postlar için cache’i sil

    return { message: `Comment with id ${id} deleted` };
  }
}
