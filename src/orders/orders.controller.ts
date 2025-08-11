// src/orders/orders.controller.ts
import {Controller, Post, Body, Get, UseGuards, Patch, Param, ParseIntPipe, Put, Query} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import {UpdateOrderStatusDto} from "./dto/update-order.dto";

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  async findAll(
      @Query('search') search?: string,
      @Query('startDate') startDate?: string,
      @Query('endDate') endDate?: string,
  ) {
    return this.ordersService.findAll(search, startDate, endDate);
  }

  @Put(':id/status')
  async updateStatus(@Param('id',ParseIntPipe) id: number, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}