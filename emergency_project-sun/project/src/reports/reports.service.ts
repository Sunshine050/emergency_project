import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateReportDto, GetReportsQueryDto, ReportType, ReportPeriod } from './dto/reports.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async findAll(hospitalId: string, query: GetReportsQueryDto) {
    const { type, period, limit = 20, offset = 0 } = query;
    
    const where: any = { hospitalId };
    if (type && type !== ReportType.ALL) where.type = type;
    if (period) where.period = period;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      reports,
      total,
      page: Math.floor(Number(offset) / Number(limit)) + 1,
      pageSize: Number(limit),
    };
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async generate(hospitalId: string, userId: string, dto: GenerateReportDto) {
    // Simulate report generation
    const report = await this.prisma.report.create({
      data: {
        hospitalId,
        title: `${dto.type.charAt(0).toUpperCase() + dto.type.slice(1)} Report - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        type: dto.type,
        period: dto.period,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: 'generating',
        generatedAt: new Date(),
        generatedBy: userId,
      },
    });

    // Mock async generation process
    setTimeout(async () => {
      await this.prisma.report.update({
        where: { id: report.id },
        data: {
          status: 'completed',
          fileUrl: `/api/reports/${report.id}/download`,
        },
      });
    }, 5000); // 5 seconds delay

    return {
      id: report.id,
      title: report.title,
      type: report.type,
      status: 'generating',
      estimatedCompletionTime: new Date(Date.now() + 5000),
    };
  }

  async getDownloadUrl(id: string) {
    const report = await this.findOne(id);
    if (report.status !== 'completed') {
      throw new NotFoundException('Report is not ready for download');
    }
    // In a real app, this would return a signed URL to S3 or similar
    // For now, we'll return a mock buffer or handle the download in the controller
    return report;
  }
}
