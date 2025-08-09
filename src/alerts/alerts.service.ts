// src/alerts/alerts.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportsService } from '../reports/reports.service';

@Injectable()
export class AlertsService {
    private readonly logger = new Logger(AlertsService.name);

    constructor(private reportsService: ReportsService) {}

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async handleLowStockAlerts() {
        this.logger.log('Checking for low stock products...');
        const lowStockProducts = await this.reportsService.getLowStockProducts();

        if (lowStockProducts.length > 0) {
            this.logger.warn(`Found ${lowStockProducts.length} products with low stock:`);
            lowStockProducts.forEach(product => {
                this.logger.warn(`- Product: ${product.name}, Stock: ${product.stock}`);
                // Here you would add logic to send an email, a Slack message, etc.
            });
        } else {
            this.logger.log('All products have sufficient stock.');
        }
    }
}