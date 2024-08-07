import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { UserWithRoles } from '../../../../../app-nest/src/users/entities/user.entity';
import { environment } from '../../../environments/environment';
import { LayoutService } from '../../layout/layout.service';
import { UsersService } from '../users.service';
import { TYPES } from '../../../../../app-nest/src/types';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    // material module
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent {
  usersService = inject(UsersService);
  layoutService = inject(LayoutService);
  environment = environment;
  TYPES = TYPES;

  users: UserWithRoles[] = [];
  errorMessage = '';
  isFetching = false;

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isFetching = true;
    this.errorMessage = '';

    this.usersService.findAll()
      .pipe(finalize(() => this.isFetching = false))
      .subscribe({
        next: (users) => {
          this.users = users;
        },
        error: (err) => {
          this.errorMessage = err.error.message;
        }
      });
  }
}
