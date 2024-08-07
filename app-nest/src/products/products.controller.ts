import { Controller, Get, Post, Body, Param, Put, UseGuards, Query, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Product, ProductWithCursorPagination } from './entities/product.entity';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RequiredPermission } from '../auth/decorators/required-permission.decorator';
import { TYPES } from '../types';
import { Request } from 'express';
import { CursorPaginationEntity } from '../_common/pagination/cursor-pagination.entity';
import { QueryProductDto } from './dto/query-product.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @RequiredPermission(TYPES.PERMISSION.PRODUCT.CREATE)
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.create(createProductDto);
    return new Product({
      id: product.id,
      name: product.name,
      slug: product.slug,
      salesPrice: product.salesPrice,
      sku: product.sku,
      barcode: product.barcode,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      archivedAt: product.archivedAt,
    });
  }

  @RequiredPermission(TYPES.PERMISSION.PRODUCT.READ)
  @Get()
  async findAll(@Query() query: QueryProductDto, @Req() req: Request) {
    const product = await this.productsService.findAllWithCursorPagination(query);
    return new ProductWithCursorPagination({
      paging: new CursorPaginationEntity(
        product.nextCursor,
        product.previousCursor,
        req.protocol + '://' + req.get('host') + req.originalUrl,
      ),
      data: product.data.map(
        (product) =>
          new Product({
            id: product.id,
            name: product.name,
            slug: product.slug,
            salesPrice: product.salesPrice,
            sku: product.sku,
            barcode: product.barcode,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            archivedAt: product.archivedAt,
          }),
      ),
    });
  }

  @RequiredPermission(TYPES.PERMISSION.PRODUCT.READ)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne('id', id);
    return new Product({
      id: product.id,
      name: product.name,
      slug: product.slug,
      salesPrice: product.salesPrice,
      sku: product.sku,
      barcode: product.barcode,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      archivedAt: product.archivedAt,
    });
  }

  @RequiredPermission(TYPES.PERMISSION.PRODUCT.UPDATE)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    const product = await this.productsService.update(id, updateProductDto);
    return new Product({
      id: product.id,
      name: product.name,
      slug: product.slug,
      salesPrice: product.salesPrice,
      sku: product.sku,
      barcode: product.barcode,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      archivedAt: product.archivedAt,
    });
  }

  @RequiredPermission(TYPES.PERMISSION.PRODUCT.ARCHIVE)
  @Put(':id/archive')
  async archive(@Param('id') id: string) {
    const product = await this.productsService.archive(id);
    return new Product({
      id: product.id,
      name: product.name,
      slug: product.slug,
      salesPrice: product.salesPrice,
      sku: product.sku,
      barcode: product.barcode,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      archivedAt: product.archivedAt,
    });
  }

  @RequiredPermission(TYPES.PERMISSION.PRODUCT.ARCHIVE)
  @Put(':id/unarchive')
  async unarchive(@Param('id') id: string) {
    const product = await this.productsService.unarchive(id);
    return new Product({
      id: product.id,
      name: product.name,
      slug: product.slug,
      salesPrice: product.salesPrice,
      sku: product.sku,
      barcode: product.barcode,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      archivedAt: product.archivedAt,
    });
  }
}
