import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { QueryProductDto } from '../../../../../app-nest/src/products/dto/query-product.dto';
import { Product } from '../../../../../app-nest/src/products/entities/product.entity';
import { urlToQueryParams } from '../../_helpers/query-params';
import { DialogsService } from '../../dialogs/dialogs.service';
import { LayoutService } from '../../layout/layout.service';
import { ProductsService } from '../products.service';
import { PermissionPipe } from '../../auth/permission.pipe';
import { TYPES } from '../../../../../app-nest/src/types';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PermissionPipe,

    // material module
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
  ],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss'
})
export class ProductsListComponent implements OnInit {
  route = inject(ActivatedRoute);
  productsService = inject(ProductsService);
  layoutService = inject(LayoutService);
  dialogsService = inject(DialogsService);
  TYPES = TYPES;

  products: Product[] = [];
  paging = {
    hasNext: false,
    hasPrevious: false,
    nextPageQueryParams: {},
    previousPageQueryParams: {},
  };
  errorMessage = '';
  isFetching = false;
  isShowArchive = false;
  isHaveQueryParams = false;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.isShowArchive = params['archived'] === 'true';
      this.isHaveQueryParams = !!Object.keys(params).length;
      this.fetchData(params);
    });
  }

  fetchData(query: QueryProductDto) {
    this.isFetching = true;
    this.errorMessage = '';

    this.productsService.findAll(query)
      .pipe(finalize(() => this.isFetching = false))
      .subscribe({
        next: ({ data, paging }) => {
          this.products = data;
          this.paging.hasNext = !!paging.nextPage;
          this.paging.hasPrevious = !!paging.previousPage;
          this.paging.nextPageQueryParams = urlToQueryParams(paging.nextPage);
          this.paging.previousPageQueryParams = urlToQueryParams(paging.previousPage);
        },
        error: (err) => {
          this.errorMessage = err.error.message;
        }
      });
  }

  unarchive(index: number) {
    this.dialogsService.confirm({
      message: `Unarchive ${this.products[index].name}.`
    }).subscribe(() => {
      this.productsService.unarchive(this.products[index].id)
        .subscribe({
          next: () => {
            this.products.splice(index, 1);
          },
          error: (err) => {
            this.dialogsService.alert({
              message: `Unable to unarchive ${this.products[index].name}. ${err.error.message}`
            });
          }
        });
    });
  }
}
