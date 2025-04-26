import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateProfileDto, UserProfileResponseDto } from "./dto/user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Update user profile
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateProfileDto.firstName ?? user.firstName,
        lastName: updateProfileDto.lastName ?? user.lastName,
        phone: updateProfileDto.phone ?? user.phone,
      },
    });

    return updatedUser;
  }
}
