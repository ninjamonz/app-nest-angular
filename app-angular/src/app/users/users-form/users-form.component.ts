import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { Role } from '../../../../../app-nest/src/roles/entities/role.entity';
import { UserWithRolesAndPermissions } from '../../../../../app-nest/src/users/entities/user.entity';
import { environment } from '../../../environments/environment';
import { checkboxAddControl, getCheckedCheckboxes } from '../../_helpers/checkbox';
import { HistoryService } from '../../_core/history.service';
import { DialogsService } from '../../dialogs/dialogs.service';
import { RolesService } from '../../roles/roles.service';
import { UsersService } from '../users.service';
import { TYPES } from '../../../../../app-nest/src/types';

@Component({
  selector: 'app-users-form',
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
  templateUrl: './users-form.component.html',
  styleUrl: './users-form.component.scss'
})
export class UsersFormComponent {
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  usersService = inject(UsersService);
  rolesService = inject(RolesService);
  historyService = inject(HistoryService);
  dialogsService = inject(DialogsService);
  environment = environment;
  TYPES = TYPES;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', Validators.email],
    rolesName: this.fb.group({})
  });

  user!: UserWithRolesAndPermissions;
  rolesOptions!: Role[];
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
        this.rolesService.findAll(),
        this.usersService.findOne(this.route.snapshot.params['id'])
      ])
        .pipe(finalize(() => this.isFetching = false))
        .subscribe({
          next: ([rolesOptions, user]) => {
            this.rolesOptions = rolesOptions;
            this.user = user;
            this.form.patchValue(this.user);
            checkboxAddControl(
              this.form.get('rolesName') as FormGroup,
              this.rolesOptions,
              this.user.roles
            );
          },
          error: (err) => {
            this.errorMessage = err.error.message;
          }
        });
    } else if (this.action === 'add') {
      this.rolesService.findAll()
        .pipe(finalize(() => this.isFetching = false))
        .subscribe({
          next: (rolesOptions) => {
            this.rolesOptions = rolesOptions;
            checkboxAddControl(
              this.form.get('rolesName') as FormGroup,
              this.rolesOptions,
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
      message: `Delete ${this.user.name}.`
    }).subscribe(() => {
      this.errorMessage = '';
      this.toggleSaving();

      this.usersService.remove(this.user.id)
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
    return this.usersService.create({
      ...this.form.getRawValue(),
      id: crypto.randomUUID(),
      rolesName: getCheckedCheckboxes(this.form.value.rolesName!)
    });
  }

  private edit() {
    return this.usersService.update(this.user.id, {
      ...this.form.getRawValue(),
      rolesName: getCheckedCheckboxes(this.form.value.rolesName!)
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
      this.historyService.back('/users');
    }
  }

  tooltip(text: string) {
    this.dialogsService.alert({
      message: text,
      title: 'Description'
    });
  }
}
