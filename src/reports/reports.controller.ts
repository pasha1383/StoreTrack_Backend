// src/reports/reports.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('low-stock')
  getLowStockReport() {
    return this.reportsService.getLowStockProducts();
  }

  @Get('sales')
  getSalesReport() {
    return this.reportsService.getSalesReport();
  }
}