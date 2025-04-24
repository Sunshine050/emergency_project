import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  // User controller methods will be implemented here
  @Get()
  @Roles(UserRole.ADMIN, UserRole.EMERGENCY_CENTER)
  findAll() {
    // Will get all users (for admin and emergency center)
    return { message: 'This endpoint will return all users' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // Will get a specific user by ID
    return { message: `This endpoint will return user with id ${id}` };
  }

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    // Will get the current user's profile
    return { message: 'This endpoint will return the current user profile', user };
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: any) {
    // Will update a user
    return { message: `This endpoint will update user with id ${id}` };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    // Will delete a user (admin only)
    return { message: `This endpoint will delete user with id ${id}` };
  }
}