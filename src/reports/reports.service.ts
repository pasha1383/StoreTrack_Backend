// src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {LessThanOrEqual, Repository} from 'typeorm';
import {Product} from "../products/entities/product.entity";
import {OrderItem} from "../orders/entities/order-item.entity";

@Injectable()
export class ReportsService {
  constructor(
      @InjectRepository(Product)
      private productRepository: Repository<Product>,
      @InjectRepository(OrderItem)
      private orderItemRepository: Repository<OrderItem>,
  ) {}

  async getLowStockProducts(threshold = 10): Promise<Product[]> {
    return this.productRepository.find({ where: { stock: LessThanOrEqual(threshold) } });
  }

  async getSalesReport(): Promise<any> {
    return this.orderItemRepository.createQueryBuilder('orderItem')
        .select('SUM(orderItem.quantity * product.price)', 'totalSales')
        .innerJoin('orderItem.product', 'product')
        .getRawOne();
  }
}