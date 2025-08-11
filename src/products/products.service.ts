// src/products/products.service.ts
import {ConflictException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import {Product} from "./entities/product.entity";
import {Transaction, TransactionType} from "./entities/transaction.entity";

@Injectable()
export class ProductsService {
  constructor(
      @InjectRepository(Product)
      private productRepository: Repository<Product>,
      @InjectRepository(Transaction)
      private transactionRepository: Repository<Transaction>,
  ) {}

  async findAll(search?: string, sort?: 'newest' | 'price_asc' | 'price_desc', category?: string): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (search) {
      queryBuilder.where('product.name LIKE :search OR product.category LIKE :search', { search: `%${search}%` });
    }

    if (category) {
      queryBuilder.andWhere('product.category = :category', { category });
    }

    if (sort) {
      switch (sort) {
        case 'newest':
          queryBuilder.orderBy('product.createdAt', 'DESC');
          break;
        case 'price_asc':
          queryBuilder.orderBy('product.price', 'ASC');
          break;
        case 'price_desc':
          queryBuilder.orderBy('product.price', 'DESC');
          break;
        default:
          break;
      }
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Product> {
    let user = await this.productRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const newProduct = this.productRepository.create(createProductDto);
    const result = await this.productRepository.save(newProduct);
    const newTransaction = this.transactionRepository.create({
      product: result,
      productId: result.id,
      type:TransactionType.IN,
      quantity:result.stock,
    });
    await this.transactionRepository.save(newTransaction);
    return result;
  }

  async update(id: number, updateProductDto: Partial<Product>): Promise<Product> {
    if (updateProductDto.name) {
      const existingProduct = await this.productRepository.findOne({ where: { name: updateProductDto.name } });
      if (existingProduct) {
        throw new ConflictException(`Product Name with Name ${updateProductDto.name} already exists`);
      }
    }
    await this.productRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    let removedProduct = await this.productRepository.delete(id);
    if (removedProduct.affected === 0) {
      throw new NotFoundException("Product Not Found");
    }
  }

  async getProductHistory(id: number): Promise<Transaction[]> {
    return this.transactionRepository.find({ where: { productId: id } });
  }

  async search(search?: string): Promise<Product[]> {
    const query = this.productRepository.createQueryBuilder('product');
    if (search) {
      query.where('product.name LIKE :search OR product.category LIKE :search', { search: `%${search}%` });
    }
    return query.getMany();
  }
}