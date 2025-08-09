// src/alerts/alerts.module.ts
import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { ReportsModule } from '../reports/reports.module';

@Module({
    imports: [ReportsModule],
    providers: [AlertsService],
})
export class AlertsModule {}