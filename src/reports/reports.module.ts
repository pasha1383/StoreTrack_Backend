import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Product} from "../products/entities/product.entity";
import {Report} from "./entities/report.entity";
import {OrderItem} from "../orders/entities/order-item.entity";

@Module({
  imports: [
      TypeOrmModule.forFeature([Product,Report,OrderItem]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports:[ReportsService]
})
export class ReportsModule {}
