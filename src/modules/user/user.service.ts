import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { RedisService } from 'src/common/redis/redis.service';
import { RedisKeys } from 'src/common/redis/redis-keys.helper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const ttlDefault = this.configService.get<number>('cache.ttlDefault');
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);

    // Yeni kullanıcı cache'e ekle
    await this.redisService.set(
      RedisKeys.user.byId(savedUser.id),
      savedUser,
      ttlDefault,
    );

    // Kullanıcı listesini invalid et
    await this.redisService.del(RedisKeys.user.all());

    return savedUser;
  }

  async getAll(useCache = true) {
    const cacheKey = RedisKeys.user.all();
    const ttlDefault = this.configService.get<number>('cache.ttlDefault');

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
      await this.redisService.set(cacheKey, usersDto, ttlDefault);
    }

    return usersDto;
  }

  async getUserById(id: number, useCache = true) {
    const cacheKey = RedisKeys.user.byId(id);
    const ttlDefault = this.configService.get<number>('cache.ttlDefault');

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
      await this.redisService.set(cacheKey, userDto, ttlDefault);
    }

    return userDto;
  }

  async update(id: number, updateData: Partial<CreateUserDto>) {
    const ttlDefault = this.configService.get<number>('cache.ttlDefault');
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    Object.assign(user, updateData);
    const updatedUser = await this.userRepository.save(user);

    const userDto: GetUserDto = {
      username: updatedUser.username,
      email: updatedUser.email,
      age: updatedUser.age,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      posts: updatedUser.posts,
    };

    // Cache güncelle
    await this.redisService.set(
      RedisKeys.user.byId(id),
      userDto,
      ttlDefault,
    );
    await this.redisService.del(RedisKeys.user.all());

    return userDto;
  }

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    await this.userRepository.softDelete(id);

    // Cache temizle
    await this.redisService.del(RedisKeys.user.byId(id));
    await this.redisService.del(RedisKeys.user.all());

    return { message: `User with id ${id} deleted` };
  }

  // Kullanıcıyı geri yükle
  async restore(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    await this.userRepository.restore(id);

    // Cache temizle
    await this.redisService.del(RedisKeys.user.byId(id));
    await this.redisService.del(RedisKeys.user.all());

    return { message: `User with id ${id} has been restored` };
  }
}
