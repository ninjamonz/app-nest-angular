import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { Permission } from '../../../../../app-nest/src/permissions/entities/permission.entity';
import { RoleWithPermissions } from '../../../../../app-nest/src/roles/entities/role.entity';
import { checkboxAddControl, getCheckedCheckboxes } from '../../_helpers/checkbox';
import { HistoryService } from '../../_core/history.service';
import { DialogsService } from '../../dialogs/dialogs.service';
import { PermissionsService } from '../permissions.service';
import { RolesService } from '../roles.service';

@Component({
  selector: 'app-roles-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    // material module
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatFormFieldModule, MatInputModule,
    MatCheckboxModule,
  ],
  templateUrl: './roles-form.component.html',
  styleUrl: './roles-form.component.scss'
})
export class RolesFormComponent implements OnInit {
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  rolesService = inject(RolesService);
  permissionsService = inject(PermissionsService);
  historyService = inject(HistoryService);
  dialogsService = inject(DialogsService);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    permissionsName: this.fb.group({})
  });

  role!: RoleWithPermissions;
  permissionsOptions!: Permission[];
  errorMessage = '';
  isFetching = false;
  isSaving = false;
  action!: 'add' | 'edit';

  ngOnInit() {
    this.action = this.route.snapshot.params['id'] ? 'edit' : 'add';
    this.errorMessage = '';
    this.isFetching = true;

    if (this.action === 'edit') {
      forkJoin([
        this.permissionsService.findAll(),
        this.rolesService.findOne(this.route.snapshot.params['id'])
      ])
        .pipe(finalize(() => this.isFetching = false))
        .subscribe({
          next: ([permissionsOptions, role]) => {
            this.permissionsOptions = permissionsOptions;
            this.role = role;
            this.form.patchValue(this.role);
            checkboxAddControl(
              this.form.get('permissionsName') as FormGroup,
              this.permissionsOptions,
              this.role.permissions
            );
          },
          error: (err) => {
            this.errorMessage = err.error.message;
          }
        });
    } else if (this.action === 'add') {
      this.permissionsService.findAll()
        .pipe(finalize(() => this.isFetching = false))
        .subscribe({
          next: (permissionsOptions) => {
            this.permissionsOptions = permissionsOptions;
            checkboxAddControl(
              this.form.get('permissionsName') as FormGroup,
              this.permissionsOptions,
              []
            );
          },
          error: (err) => {
            this.errorMessage = err.error.message;
          }
        });
    }
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

  remove() {
    this.dialogsService.confirm({
      message: `Delete ${this.role.name}.`
    }).subscribe(() => {
      this.errorMessage = '';
      this.toggleSaving();

      this.rolesService.remove(this.role.id)
        .pipe(finalize(() => this.toggleSaving()))
        .subscribe({
          next: () => {
            this.dialogsService.alert({
              message: 'Successfully deleted.'
            }).subscribe(() => this.back());
          },
          error: (err) => {
            this.errorMessage = err.error.message;
          }
        });
    });
  }

  private add() {
    return this.rolesService.create({
      ...this.form.getRawValue(),
      id: crypto.randomUUID(),
      permissionsName: getCheckedCheckboxes(this.form.value.permissionsName!)
    });
  }

  private edit() {
    return this.rolesService.update(this.role.id, {
      ...this.form.getRawValue(),
      permissionsName: getCheckedCheckboxes(this.form.value.permissionsName!)
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
      this.historyService.back('/roles');
    }
  }

  tooltip(text: string) {
    this.dialogsService.alert({
      message: text,
      title: 'Description'
    });
  }
}
