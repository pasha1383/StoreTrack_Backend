// src/alerts/alerts.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportsService } from '../reports/reports.service';
import {MailService} from "../mail/mail.service";
import {User} from "../auth/entities/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

@Injectable()
export class AlertsService {
    private readonly logger = new Logger(AlertsService.name);

    constructor(
        private reportsService: ReportsService,
        private mailService: MailService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async handleLowStockAlerts() {
        this.logger.log('Checking for low stock products...');
        const lowStockProducts = await this.reportsService.getLowStockProducts();


        if (lowStockProducts.length > 0) {
            const adminEmail = 'parsashadkam2004@gmail.com';
            this.logger.warn(`Found ${lowStockProducts.length} products with low stock. Sending alert email to ${adminEmail}.`);
            await this.mailService.sendLowStockAlert(adminEmail, lowStockProducts);
        } else {
            this.logger.log('All products have sufficient stock.');
        }
    }
}