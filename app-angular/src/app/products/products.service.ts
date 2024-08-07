import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Params } from '@angular/router';
import { CreateProductDto } from '../../../../app-nest/src/products/dto/create-product.dto';
import { QueryProductDto } from '../../../../app-nest/src/products/dto/query-product.dto';
import { UpdateProductDto } from '../../../../app-nest/src/products/dto/update-product.dto';
import { Product, ProductWithCursorPagination } from '../../../../app-nest/src/products/entities/product.entity';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  #http = inject(HttpClient);

  constructor() { }

  create(createProductDto: CreateProductDto) {
    return this.#http.post<Product>(
      `${environment.apiUrl}/products`,
      createProductDto
    );
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.#http.put<Product>(
      `${environment.apiUrl}/products/${id}`,
      updateProductDto
    );
  }

  archive(id: string) {
    return this.#http.put<Product>(
      `${environment.apiUrl}/products/${id}/archive`,
      {}
    );
  }

  unarchive(id: string) {
    return this.#http.put<Product>(
      `${environment.apiUrl}/products/${id}/unarchive`,
      {}
    );
  }

  findOne(id: string) {
    return this.#http.get<Product>(
      `${environment.apiUrl}/products/${id}`
    );
  }

  findAll(query: QueryProductDto) {
    const params = new URLSearchParams(query as Params).toString();
    const queryString = params ? `?${params}` : '';

    return this.#http.get<ProductWithCursorPagination>(
      `${environment.apiUrl}/products${queryString}`
    );
  }
}
