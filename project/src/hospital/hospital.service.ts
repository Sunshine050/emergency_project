import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HospitalService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const { name, city } = query;

    return this.prisma.organization.findMany({
      where: {
        type: 'HOSPITAL',
        ...(name && { name: { contains: name, mode: 'insensitive' } }),
        ...(city && { city: { contains: city, mode: 'insensitive' } }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
    });
    if (!org || org.type !== 'HOSPITAL') {
      throw new NotFoundException(`Hospital with id ${id} not found`);
    }
    return {
      id: org.id,
      name: org.name,
      address: org.address,
      contactPhone: org.contactPhone,
      status: org.status,
      city: org.city,
      state: org.state,
      postalCode: org.postalCode,
      latitude: org.latitude,
      longitude: org.longitude,
      contactEmail: org.contactEmail,
    };
  }

  async create(createHospitalDto: any) {
    return this.prisma.organization.create({
      data: {
        ...createHospitalDto,
        type: 'HOSPITAL',
      },
    });
  }

  async update(id: string, updateHospitalDto: any) {
    await this.findOne(id);
    return this.prisma.organization.update({
      where: { id },
      data: updateHospitalDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.organization.delete({
      where: { id },
    });
  }

  async getCapacity(id: string) {
    const org = await this.findOne(id);
    return {
      id: org.id,
      name: org.name,
      capacity: {
        totalBeds: 0, // สมมติ ไม่มีข้อมูลจริง
        availableBeds: 0, // สมมติ ไม่มีข้อมูลจริง
      },
    };
  }
}