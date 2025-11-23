import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    const report = await this.reportsService.findOne(id);
    return {
      id: report.id,
      status: report.status,
      progress: report.status === 'completed' ? 100 : 50,
      fileUrl: report.fileUrl,
    };
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const report = await this.reportsService.findOne(id);
    
    if (report.status !== 'completed') {
      throw new NotFoundException('Report is not ready');
    }

    // Mock PDF generation
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="report-${id}.pdf"`,
    });
    
    // Send a simple text as PDF content for demo
    res.send(`Report ID: ${id}\nTitle: ${report.title}\nGenerated At: ${report.generatedAt}`);
  }
}
