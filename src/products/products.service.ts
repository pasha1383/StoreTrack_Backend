// src/products/products.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import {Product} from "./entities/product.entity";
import {Transaction} from "./entities/transaction.entity";

@Injectable()
export class ProductsService {
  constructor(
      @InjectRepository(Product)
      private productRepository: Repository<Product>,
      @InjectRepository(Transaction)
      private transactionRepository: Repository<Transaction>,
  ) {}

  // async findAll(): Promise<Product[]> {
  //   return this.productRepository.find();
  // }

  async findOne(id: number): Promise<Product> {
    let user = await this.productRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = this.productRepository.create(createProductDto);
    return this.productRepository.save(newProduct);
  }

  async update(id: number, updateProductDto: Partial<Product>): Promise<Product> {
    await this.productRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }

  async getProductHistory(id: number): Promise<Transaction[]> {
    return this.transactionRepository.find({ where: { productId: id } });
  }

  async findAll(search?: string): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product');
    if (search) {
      query.where('product.name LIKE :search OR product.category LIKE :search', { search: `%${search}%` });
    }
    return query.getMany();
  }
}