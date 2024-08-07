import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { Role } from '../../../../../app-nest/src/roles/entities/role.entity';
import { LayoutService } from '../../layout/layout.service';
import { RolesService } from '../roles.service';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,

    // material module
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './roles-list.component.html',
  styleUrl: './roles-list.component.scss'
})
export class RolesListComponent {
  rolesService = inject(RolesService);
  layoutService = inject(LayoutService);

  roles: Role[] = [];
  errorMessage = '';
  isFetching = false;

  ngOnInit() {
    this.fetchData();
  }

  fetchData() {
    this.isFetching = true;
    this.errorMessage = '';

    this.rolesService.findAll()
      .pipe(finalize(() => this.isFetching = false))
      .subscribe({
        next: (roles) => {
          this.roles = roles;
        },
        error: (err) => {
          this.errorMessage = err.error.message;
        }
      });
  }
}
