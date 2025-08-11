// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ProductsModule } from '../products/products.module';
import {OrderItem} from "./entities/order-item.entity";
import {Order} from "./entities/order.entity";
import {Product} from "../products/entities/product.entity";
import {Transaction} from "../products/entities/transaction.entity"; // Import ProductsModule

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem,Product,Transaction]), ProductsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}