import { Component, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from '@angular/fire/auth';
import { AuthService } from '../auth.service';
import { lastValueFrom } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogsSignInAsComponent } from '../dialogs-sign-in-as/dialogs-sign-in-as.component';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TYPES } from '../../../../../app-nest/src/types';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  fireAuth = inject(Auth);
  authService = inject(AuthService);
  dialog = inject(MatDialog);
  router = inject(Router);

  errorMessage = '';
  isFetching = false;

  async signIn(type: 'google' | 'demo') {
    this.errorMessage = '';
    this.isFetching = true;

    // --------------------------- AUTHENTICATION --------------------------- //
    try {
      if (type === 'google') {
        const provider = new GoogleAuthProvider().setCustomParameters({ prompt: 'select_account' });
        await signInWithPopup(this.fireAuth, provider);
      } else {
        await signInWithEmailAndPassword(this.fireAuth, 'just4tesing@gmail.com', 'password');
      }
    } catch (err: any) {
      this.isFetching = false;
      switch (err.code) {
        case 'auth/popup-closed-by-user':
          this.errorMessage = `It looks like you closed the sign-in window before completing the sign-in process. Please try again to complete the sign-in.`;
          break;
        case 'auth/admin-restricted-operation':
          this.errorMessage = `Account registration is not available.`;
          break;
        case 'auth/user-disabled':
          this.errorMessage = `Your account has been disabled.`;
          break;
        case 'auth/invalid-credential':
          this.errorMessage = `Invalid credential.`;
          break;
        default:
          this.errorMessage = `Failed to sign in.`;
          break;
      }
      return;
    }

    // --------------------------- AUTHORIZATION --------------------------- //
    try {
      this.authService.userInfo = await lastValueFrom(this.authService.info());

      if (!this.authService.userInfo.roles.length) {
        if (this.authService.userInfo.id === environment.superUserId) {
          this.authService.signInAs = TYPES.PERMISSION.SUPERUSER;
        } else {
          throw new Error(`You do not have any permissions.`);
        }
      } else if (this.authService.userInfo.roles.length === 1) {
        this.authService.signInAs = this.authService.userInfo.roles[0].name;
      } else {
        const roleName: string = await lastValueFrom(
          this.dialog.open(DialogsSignInAsComponent, {
            data: {},
            disableClose: true,
            autoFocus: false,
            restoreFocus: false,
            minWidth: '250px',
          }).afterClosed()
        );
        this.authService.signInAs = roleName;
      }

      this.router.navigateByUrl('/');
    } catch (err: any) {
      this.isFetching = false;
      this.errorMessage = err.message || err.error.message;
      await this.fireAuth.signOut();
      this.authService.reset();
    }
  }
}
