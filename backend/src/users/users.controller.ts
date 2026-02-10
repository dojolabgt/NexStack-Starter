import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { User } from '../auth/decorators/user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/constants/roles';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  // Profile endpoint MUST come before :id routes
  @Patch('profile')
  async updateProfile(
    @User() user: AuthenticatedUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updatedUser = await this.usersService.updateProfile(
      user.id,
      updateProfileDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...result } = updatedUser;
    return result;
  }

  @Patch('change-password')
  async changePassword(
    @User() user: AuthenticatedUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(
      user.id,
      changePasswordDto.password,
    );
    return { message: 'Password updated successfully' };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOneById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateByAdmin(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
