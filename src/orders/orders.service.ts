// src/orders/orders.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from './order.status.enum';
import {Order} from "./entities/order.entity";
import {OrderItem} from "./entities/order-item.entity";
import {Product} from "../products/entities/product.entity";
import {Transaction, TransactionType} from "../products/entities/transaction.entity";
import {UpdateOrderStatusDto} from "./dto/update-order.dto";
import {AlertsService} from "../alerts/alerts.service";

@Injectable()
export class OrdersService {
  constructor(
      @InjectRepository(Order)
      private orderRepository: Repository<Order>,
      @InjectRepository(OrderItem)
      private orderItemRepository: Repository<OrderItem>,
      @InjectRepository(Product) // Inject Product repository to use it directly
      private productRepository: Repository<Product>,
      @InjectRepository(Transaction) // Inject Transaction repository
      private transactionRepository: Repository<Transaction>,
      private alertService:AlertsService,
      private dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newOrder = this.orderRepository.create();
      const savedOrder = await queryRunner.manager.save(newOrder);

      for (const item of createOrderDto.items) {
        const product = await queryRunner.manager.findOne(Product, { where: { id: item.productId } });
        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }
        product.stock -= item.quantity;
        await queryRunner.manager.save(product);

        const orderItem = this.orderItemRepository.create({
          order: savedOrder,
          product,
          quantity: item.quantity,
        });
        await queryRunner.manager.save(orderItem);
      }

      await queryRunner.commitTransaction();
      await this.alertService.handleLowStockAlerts()
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(search?: string, startDate?: string, endDate?: string): Promise<Order[]> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.orderItems', 'orderItem')
        .leftJoinAndSelect('orderItem.product', 'product');

    if (search) {
      queryBuilder.where('product.name LIKE :search', { search: `%${search}%` });
    }

    if (startDate && endDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD.');
      }

      queryBuilder.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    return queryBuilder.getMany();
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id }, relations: ['orderItems', 'orderItems.product'] });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Check if the status is changing to SHIPPED
    if (order.status !== OrderStatus.SHIPPED && updateOrderStatusDto.status === OrderStatus.SHIPPED) {
      for (const orderItem of order.orderItems) {
        const transaction = this.transactionRepository.create({
          product: orderItem.product,
          productId: orderItem.product.id,
          type: TransactionType.OUT,
          quantity: orderItem.quantity,
        });
        await this.transactionRepository.save(transaction);
      }
    }

    // Check if the status is changing to CANCELED
    if (order.status !== OrderStatus.CANCELED && updateOrderStatusDto.status === OrderStatus.CANCELED) {
      for (const orderItem of order.orderItems) {
        // Restore stock
        const product = await this.productRepository.findOne({ where: { id: orderItem.product.id } });
        if (product) {
          product.stock += orderItem.quantity;
          await this.productRepository.save(product);
        }

        // Create an "IN" transaction
        const transaction = this.transactionRepository.create({
          product: orderItem.product,
          productId: orderItem.product.id,
          type: TransactionType.IN,
          quantity: orderItem.quantity,
        });
        await this.transactionRepository.save(transaction);
      }
    }

    order.status = updateOrderStatusDto.status;
    return this.orderRepository.save(order);
  }
}