// src/products/products.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  constructor(private dataSource: DataSource) {}

  async findAll(search?: string, sort?: 'newest' | 'price_asc' | 'price_desc', category?: string): Promise<Product[]> {
    const queryBuilder = this.dataSource.getRepository(Product).createQueryBuilder('product');

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
    const product = await this.dataSource.getRepository(Product).findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productRepository = queryRunner.manager.getRepository(Product);
      const transactionRepository = queryRunner.manager.getRepository(Transaction);

      const newProduct = productRepository.create(createProductDto);
      const result = await productRepository.save(newProduct);

      const newTransaction = transactionRepository.create({
        product: result,
        productId: result.id,
        type: TransactionType.IN,
        quantity: result.stock,
      });
      await transactionRepository.save(newTransaction);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateProductDto: Partial<UpdateProductDto>): Promise<Product> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productRepository = queryRunner.manager.getRepository(Product);
      const transactionRepository = queryRunner.manager.getRepository(Transaction);

      const existingProduct = await productRepository.findOne({ where: { id } });
      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      const updatedStock = updateProductDto.stock ?? existingProduct.stock;
      const stockDifference = updatedStock - existingProduct.stock;

      await productRepository.update(id, updateProductDto);

      if (stockDifference !== 0) {
        const transactionType = stockDifference > 0 ? TransactionType.IN : TransactionType.OUT;
        const transaction = transactionRepository.create({
          product: existingProduct,
          productId: existingProduct.id,
          type: transactionType,
          quantity: Math.abs(stockDifference),
        });
        await transactionRepository.save(transaction);
      }
      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const productRepository = this.dataSource.getRepository(Product);
      const transactionRepository =  this.dataSource.getRepository(Transaction);
      const deletedTransaction = await transactionRepository.delete({productId : id});
      const product = await productRepository.findOne({ where: { id } });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      await productRepository.delete(id);
    } catch (error) {
      console.error(error);
      throw new BadRequestException("Product Not Found");
    }
  }

  async getProductHistory(id: number): Promise<Transaction[]> {
    return this.dataSource.getRepository(Transaction).find({ where: { productId: id } });
  }
}