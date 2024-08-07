import { CursorPaginationEntity } from '../../_common/pagination/cursor-pagination.entity';

export class Product {
  id!: string;
  name!: string;
  slug!: string;
  salesPrice!: string;
  sku!: string;
  barcode!: string;
  createdAt!: string;
  updatedAt!: string;
  archivedAt!: string;

  constructor(entity: Product) {
    Object.assign(this, entity);
  }
}

export class ProductWithCursorPagination {
  data!: Product[];
  paging!: CursorPaginationEntity;

  constructor(entity: ProductWithCursorPagination) {
    Object.assign(this, entity);
  }
}
