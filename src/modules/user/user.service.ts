import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create({
      ...createUserDto,
    });
    const savedUser = await this.userRepository.save(user);

    // Yeni kullanıcı cache'e eklenebilir
    await this.redisService.set(`user:${savedUser.id}`, savedUser, 60);

    return savedUser;
  }

  async getAll(useCache = true) {
    const cacheKey = 'users:all';

    if (useCache) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return cached;
    }

    const users = await this.userRepository.find({ relations: ['posts'] });
    const usersDto: GetUserDto[] = users.map((user) => ({
      username: user.username,
      email: user.email,
      age: user.age,
      role: user.role,
      isActive: user.isActive,
      posts: user.posts,
    }));

    if (useCache) {
      await this.redisService.set(cacheKey, usersDto, 60); // 60 saniye cache
    }

    return usersDto;
  }

  async getUserById(id: number, useCache = true) {
    const cacheKey = `user:${id}`;

    if (useCache) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return cached;
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['posts'],
    });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    const userDto: GetUserDto = {
      username: user.username,
      email: user.email,
      age: user.age,
      role: user.role,
      isActive: user.isActive,
      posts: user.posts,
    };

    if (useCache) {
      await this.redisService.set(cacheKey, userDto, 60);
    }

    return userDto;
  }

  async update(id: number, updateData: Partial<CreateUserDto>) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    Object.assign(user, updateData);
    const updatedUser = await this.userRepository.save(user);
    const userDto: GetUserDto = {
      username: user.username,
      email: user.email,
      age: user.age,
      role: user.role,
      isActive: user.isActive,
      posts: user.posts,
    };

    // Cache güncelle
    await this.redisService.set(`user:${id}`, userDto, 60);
    await this.redisService.del('users:all'); // tüm kullanıcılar cache’i sil

    return userDto;
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    await this.userRepository.softDelete(id); // soft delete kullanıyoruz
    await this.redisService.del(`user:${id}`);
    await this.redisService.del('users:all'); // tüm kullanıcılar cache’i sil

    return { message: `User with id ${id} deleted` };
  }

  // UserService içinde restore metodu
  async restore(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true, // silinmiş kayıtları da dahil et
    });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    await this.userRepository.restore(id);

    // Cache güncelle (silinmiş user cache'i temizlenebilir)
    await this.redisService.del(`user:${id}`);
    await this.redisService.del('users:all');

    return { message: `User with id ${id} has been restored` };
  }
}
