import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../drizzle.schema';
import slugify from 'slugify';
import { and, asc, desc, eq, gt, isNotNull, isNull, lt } from 'drizzle-orm';
import { TYPES } from '../types';
import { trim } from '../_common/helpers/trim';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(@Inject(TYPES.DRIZZLE_TAG) private drizzle: NodePgDatabase<typeof schema>) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const result = await this.drizzle
        .insert(schema.products)
        .values({
          id: createProductDto.id,
          name: trim(createProductDto.name),
          slug: slugify(createProductDto.name),
          salesPrice: createProductDto.salesPrice,
          sku: createProductDto.sku.toUpperCase() || null,
          barcode: createProductDto.barcode.toUpperCase() || null,
          createdAt: new Date().toISOString(),
        })
        .returning();
      return result[0];
    } catch (error) {
      this.errorHandle(error);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne('id', id);

    try {
      const result = await this.drizzle
        .update(schema.products)
        .set({
          name: trim(updateProductDto.name),
          slug: slugify(updateProductDto.name),
          salesPrice: updateProductDto.salesPrice,
          sku: updateProductDto.sku.toUpperCase() || null,
          barcode: updateProductDto.barcode.toUpperCase() || null,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.products.id, id))
        .returning();
      return result[0];
    } catch (error) {
      this.errorHandle(error);
    }
  }

  async archive(id: string) {
    await this.findOne('id', id);

    const result = await this.drizzle
      .update(schema.products)
      .set({ archivedAt: new Date().toISOString() })
      .where(eq(schema.products.id, id))
      .returning();
    return result[0];
  }

  async unarchive(id: string) {
    await this.findOne('id', id);

    const result = await this.drizzle
      .update(schema.products)
      .set({ archivedAt: null })
      .where(eq(schema.products.id, id))
      .returning();
    return result[0];
  }

  private errorHandle(error: any) {
    if (error.code === '23505') {
      switch (error.constraint) {
        case 'products_slug_unique':
          throw new ConflictException('Duplicated name.', 'name_unique');
        case 'products_sku_unique':
          throw new ConflictException('Duplicated SKU.', 'sku_unique');
        case 'products_barcode_unique':
          throw new ConflictException('Duplicated barcode.', 'barcode_unique');
      }
      throw new ConflictException();
    }
    throw error;
  }

  // --------------------------- QUERY --------------------------- //

  async findOne(key: keyof typeof schema.products.$inferSelect, value: string) {
    const result = await this.drizzle.query.products.findFirst({
      where: eq(schema.products[key], value),
    });
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  async findAll() {
    const result = await this.drizzle.query.products.findMany({
      where: isNull(schema.products.archivedAt),
      orderBy: asc(schema.products.slug),
    });
    return result;
  }

  async findAllWithCursorPagination(query: QueryProductDto) {
    const cursorKey: keyof typeof schema.products.$inferSelect = 'slug';
    if (query.after || query.before) {
      await this.findOne(cursorKey, query.after || query.before);
    }

    const st = {
      where:
        query.archived === 'true'
          ? isNotNull(schema.products.archivedAt)
          : isNull(schema.products.archivedAt),
      orderBy: asc(schema.products[cursorKey]),
      limit: query.limit + 1,
    };

    if (query.after) {
      st.where = and(st.where, gt(schema.products[cursorKey], query.after));
    } else if (query.before) {
      st.where = and(st.where, lt(schema.products[cursorKey], query.before));
      st.orderBy = desc(schema.products[cursorKey]);
    }

    const result = await this.drizzle.query.products.findMany(st);
    const response = {
      nextCursor: '',
      previousCursor: '',
      data: [] as typeof result,
    };

    if (!result.length) {
      return response;
    }
    if (!query.before) {
      const hasNext = result.length > query.limit;
      response.nextCursor = hasNext ? result[query.limit - 1][cursorKey] : '';
      response.previousCursor = query.after ? result[0][cursorKey] : '';
      response.data = hasNext ? result.slice(0, -1) : result;
    } else {
      const hasPrevious = result.length > query.limit;
      response.nextCursor = result[0][cursorKey];
      response.previousCursor = hasPrevious ? result[query.limit - 1][cursorKey] : '';
      response.data = hasPrevious ? result.slice(0, -1).reverse() : result.reverse();
    }

    return response;
  }
}
