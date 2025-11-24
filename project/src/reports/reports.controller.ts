import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiProduces } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Response } from 'express';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':id/status')
  @ApiOperation({ summary: 'Get report status', description: 'Get the generation status of a report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
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
  @ApiOperation({ summary: 'Download report', description: 'Download a completed report as PDF' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'Report downloaded successfully', content: { 'application/pdf': {} } })
  @ApiResponse({ status: 404, description: 'Report not found or not ready' })
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
