// src/orders/order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import {OrderStatus} from "../order.status.enum";

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
    orderItems: OrderItem[];
}