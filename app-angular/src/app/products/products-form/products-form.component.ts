import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { Product } from '../../../../../app-nest/src/products/entities/product.entity';
import { HistoryService } from '../../_core/history.service';
import { DialogsService } from '../../dialogs/dialogs.service';
import { ProductsService } from '../products.service';
import { PermissionPipe } from '../../auth/permission.pipe';
import { TYPES } from '../../../../../app-nest/src/types';
import { provideNgxMask, NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-products-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NgxMaskDirective, NgxMaskPipe,
    PermissionPipe,

    // material module
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatFormFieldModule, MatInputModule,
  ],
  providers: [provideNgxMask()],
  templateUrl: './products-form.component.html',
  styleUrl: './products-form.component.scss'
})
export class ProductsFormComponent implements OnInit {
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  productsService = inject(ProductsService);
  historyService = inject(HistoryService);
  dialogsService = inject(DialogsService);
  TYPES = TYPES;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    salesPrice: ['', Validators.required],
    sku: [''],
    barcode: [''],
  });

  product!: Product;
  errorMessage = '';
  isFetching = false;
  isSaving = false;
  action!: 'add' | 'edit';

  ngOnInit() {
    this.action = this.route.snapshot.params['id'] ? 'edit' : 'add';
    if (this.action === 'edit') {
      this.fetchData(this.route.snapshot.params['id']);
    }
  }

  fetchData(id: string) {
    this.errorMessage = '';
    this.isFetching = true;

    this.productsService.findOne(id)
      .pipe(finalize(() => this.isFetching = false))
      .subscribe({
        next: (product) => {
          this.product = product;
          this.form.patchValue(this.product);
        },
        error: (err) => {
          this.errorMessage = err.error.message;
        }
      });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage = '';
    this.toggleSaving();

    this[this.action]()
      .pipe(finalize(() => this.toggleSaving()))
      .subscribe({
        next: () => {
          this.dialogsService.alert({
            message: 'Successfully saved.'
          }).subscribe(() => this.back());
        },
        error: (err) => {
          this.errorMessage = err.error.message;
        }
      });
  }

  private add() {
    return this.productsService.create({
      ...this.form.getRawValue(),
      id: crypto.randomUUID(),
      salesPrice: this.form.value.salesPrice!.toString()
    });
  }

  private edit() {
    return this.productsService.update(this.product.id, {
      ...this.form.getRawValue(),
      salesPrice: this.form.value.salesPrice!.toString()
    });
  }

  handleArchive(action: 'archive' | 'unarchive') {
    const messages = {
      archive: {
        confirm: `Archive ${this.product.name}.`,
        success: `Successfully archived.`
      },
      unarchive: {
        confirm: `Unarchive ${this.product.name}.`,
        success: `Successfully unarchived.`
      }
    };
    const message = messages[action];

    this.dialogsService.confirm({
      message: message.confirm
    }).subscribe(() => {
      this.errorMessage = '';
      this.toggleSaving();

      this.productsService[action](this.product.id)
        .pipe(finalize(() => this.toggleSaving()))
        .subscribe({
          next: () => {
            this.dialogsService.alert({
              message: message.success
            }).subscribe(() => this.back());
          },
          error: (err) => {
            this.errorMessage = err.error.message;
          }
        });
    });
  }

  private toggleSaving() {
    this.isSaving = !this.isSaving;
    this.form.enabled ? this.form.disable() : this.form.enable();
  }

  back() {
    if (this.isSaving) {
      this.dialogsService.alert({
        message: `Saving changes. Please wait.`
      });
    } else {
      this.historyService.back('/products');
    }
  }
}
