// src/products/transaction.entity.ts
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn} from 'typeorm';
import { Product } from './product.entity';

export enum TransactionType {
    IN = 'in',
    OUT = 'out',
}

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Product, product => product.transactions)
    product: Product;

    @Column()
    productId: number;

    @Column('enum', { enum: TransactionType ,default:TransactionType.IN })
    type: TransactionType;

    @Column()
    quantity: number;

    @CreateDateColumn()
    createdAt: Date;
}