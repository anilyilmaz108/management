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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('all/:cache')
  async getAllUsers(@Param('cache') cache: string) {
    const useCache = cache === 'true';
    return this.userService.getAll(useCache);
  }

  @Get(':id/:cache')
  async getUser(@Param('id') id: number, @Param('cache') cache: string) {
    const useCache = cache === 'true';
    return this.userService.getUserById(id, useCache);
  }

  @Patch('update/:id')
  async updateUser(
    @Param('id') id: number,
    @Body() updateData: Partial<CreateUserDto>,
  ) {
    return this.userService.update(id, updateData);
  }

  @Delete('delete/:id')
  async deleteUser(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @Patch('restore/:id')
  async restoreUser(@Param('id') id: number) {
    return this.userService.restore(id);
  }
}
