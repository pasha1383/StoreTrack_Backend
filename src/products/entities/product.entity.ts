// src/products/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}