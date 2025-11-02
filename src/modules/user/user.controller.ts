import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entity/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { GetUserDto } from './dto/get-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { UserRole } from 'src/common/enum/roles.enum';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBody({ type: CreateUserDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.YONETICI)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('all/:cache')
  @ApiOperation({ summary: 'Get all users' })
  @ApiParam({
    name: 'cache',
    description: 'Use cache? true/false',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: [GetUserDto],
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.YONETICI)
  getAllUsers(@Param('cache') cache: string) {
    const useCache = cache === 'true';
    return this.userService.getAll(useCache);
  }

  @Get(':id/:cache')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', description: 'User ID', required: true })
  @ApiParam({
    name: 'cache',
    description: 'Use cache? true/false',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'User data', type: GetUserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.YONETICI)
  getUser(@Param('id') id: number, @Param('cache') cache: string) {
    const useCache = cache === 'true';
    return this.userService.getUserById(id, useCache);
  }

  @Patch('update/:id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID', required: true })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 200, description: 'User updated', type: GetUserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.YONETICI)
  updateUser(
    @Param('id') id: number,
    @Body() updateData: Partial<CreateUserDto>,
  ) {
    return this.userService.update(id, updateData);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiParam({ name: 'id', description: 'User ID', required: true })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.YONETICI)
  deleteUser(@Param('id') id: number) {
    return this.userService.remove(id);
  }

  @Patch('restore/:id')
  @ApiOperation({ summary: 'Restore soft deleted user' })
  @ApiParam({ name: 'id', description: 'User ID', required: true })
  @ApiResponse({
    status: 200,
    description: 'User restored',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.YONETICI)
  restoreUser(@Param('id') id: number) {
    return this.userService.restore(id);
  }
}
