import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put, ParseIntPipe, Query} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {AuthGuard} from "@nestjs/passport";

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(
      @Query('search') search?: string,
      @Query('sort') sort?: 'newest' | 'price_asc' | 'price_desc',
      @Query('category') category?: string,
  ) {
    return this.productsService.findAll(search, sort, category);
  }

  @Get(':id')
  findOne(@Param('id',ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id',ParseIntPipe) id: number) {
    console.log("removeProduct", id);
    await this.productsService.remove(id);
    return {
      message: `Product With ID ${id} Deleted`,
    }
  }

  @Get(':id/history')
  getProductHistory(@Param('id',ParseIntPipe) id: number) {
    return this.productsService.getProductHistory(id);
  }


}
