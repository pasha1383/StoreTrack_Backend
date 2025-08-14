// src/alerts/alerts.module.ts
import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { ReportsModule } from '../reports/reports.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Product} from "../products/entities/product.entity";
import {OrderItem} from "../orders/entities/order-item.entity";
import {Report} from "../reports/entities/report.entity";
import {ReportsService} from "../reports/reports.service";
import {MailService} from "../mail/mail.service";
import {User} from "../auth/entities/user.entity";

@Module({
    imports: [
        ReportsModule,
        TypeOrmModule.forFeature([Product,Report,OrderItem,User]),
    ],
    providers: [AlertsService,ReportsService,MailService],
    exports: [AlertsService],
})
export class AlertsModule {}