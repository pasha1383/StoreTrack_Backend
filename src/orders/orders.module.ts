// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ProductsModule } from '../products/products.module';
import {OrderItem} from "./entities/order-item.entity";
import {Order} from "./entities/order.entity";
import {Product} from "../products/entities/product.entity";
import {Transaction} from "../products/entities/transaction.entity";
import {AlertsService} from "../alerts/alerts.service";
import {User} from "../auth/entities/user.entity";
import {ReportsService} from "../reports/reports.service";
import {MailService} from "../mail/mail.service"; // Import ProductsModule

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem,Product,Transaction,User]), ProductsModule],
  controllers: [OrdersController],
  providers: [OrdersService,AlertsService,ReportsService,MailService],
  exports: [OrdersService],
})
export class OrdersModule {}