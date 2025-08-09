// src/products/product.entity.ts
import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: 0 })
    stock: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column()
    category: string;

    @OneToMany(() => Transaction, transaction => transaction.product)
    transactions: Transaction[];
}