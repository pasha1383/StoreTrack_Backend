// src/orders/orders.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto'
import {Order} from "./entities/order.entity";
import {Product} from "../products/entities/product.entity";
import {OrderItem} from "./entities/order-item.entity";
import {UpdateOrderStatusDto} from "./dto/update-order.dto";

@Injectable()
export class OrdersService {
  constructor(
      @InjectRepository(Order)
      private orderRepository: Repository<Order>,
      @InjectRepository(OrderItem)
      private orderItemRepository: Repository<OrderItem>,
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
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['orderItems', 'orderItems.product'] });
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.status = updateOrderStatusDto.status;
    return this.orderRepository.save(order);
  }
}