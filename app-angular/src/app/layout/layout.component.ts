import { BreakpointObserver } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Component, inject, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDrawerMode, MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterModule } from '@angular/router';
import { LayoutService } from './layout.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { DialogsSignInAsComponent } from '../auth/dialogs-sign-in-as/dialogs-sign-in-as.component';
import { AuthService } from '../auth/auth.service';
import { Auth } from '@angular/fire/auth';
import { TYPES } from '../../../../app-nest/src/types';
import { PermissionPipe } from '../auth/permission.pipe';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PermissionPipe,

    // material module
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  breakpointObserver = inject(BreakpointObserver);
  layoutService = inject(LayoutService);
  fireAuth = inject(Auth);
  authService = inject(AuthService);
  router = inject(Router);
  dialog = inject(MatDialog);
  TYPES = TYPES;

  leftSidenav = viewChild.required<MatSidenav>('leftSidenav');
  leftSidenavMode!: MatDrawerMode;
  leftSidenavOpened!: boolean;
  breakpointSize = '(max-width: 600px)';

  constructor() {
    this.breakpointObserver.observe([this.breakpointSize])
      .pipe(takeUntilDestroyed())
      .subscribe(result => {
        if (result.matches) {
          this.leftSidenavMode = 'over';
          this.leftSidenavOpened = false;
        } else {
          this.leftSidenavMode = 'side';
          this.leftSidenavOpened = true;
        }
      });

    this.layoutService.leftSidenav$
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.leftSidenav().toggle());
  }

  onPathChange() {
    if (this.leftSidenavMode !== 'side') {
      this.leftSidenav().toggle();
    }
  }

  async signOut() {
    await this.fireAuth.signOut();
    this.router.navigateByUrl('/auth/sign-in');
  }

  openRoleSwitcher() {
    this.dialog.open(DialogsSignInAsComponent, {
      data: {},
      disableClose: false,
      autoFocus: false,
      restoreFocus: false,
      minWidth: '250px',
    }).afterClosed().subscribe((roleName: string) => {
      if (roleName && roleName !== this.authService.signInAs) {
        this.authService.signInAs = roleName;
        location.replace('/');
      }
    });
  }
}
