// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import {Product} from "./entities/product.entity";
import { Transaction } from './entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product,Transaction])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}