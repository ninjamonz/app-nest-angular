import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { lastValueFrom } from 'rxjs';
import { DialogsService } from '../dialogs/dialogs.service';
import { Auth } from '@angular/fire/auth';
import { environment } from '../../environments/environment';
import { TYPES } from '../../../../app-nest/src/types';

export const authGuard: CanActivateFn = async (route, state) => {
  const fireAuth = inject(Auth);
  const authService = inject(AuthService);
  const router = inject(Router);
  const dialogsService = inject(DialogsService);

  try {
    await fireAuth.authStateReady();
    if (!fireAuth.currentUser) {
      return router.parseUrl('/auth/sign-in');
    }

    if (!authService.userInfo.id) {
      authService.userInfo = await lastValueFrom(authService.info());

      // in case user close the sign-in page before choosing the signInAs
      // or user's roles updated
      // or signInAs localStorage deleted
      if (authService.userInfo.roles.length) {
        if (authService.signInAs) {
          if (!authService.hasRole(authService.signInAs)) {
            authService.signInAs = authService.userInfo.roles[0].name;
          }
        } else {
          authService.signInAs = authService.userInfo.roles[0].name;
        }
      } else {
        if (authService.userInfo.id === environment.superUserId) {
          authService.signInAs = TYPES.PERMISSION.SUPERUSER;
        } else {
          throw new Error(`You do not have any permissions.`);
        }
      }
    }

    return true;
  } catch (err: any) {
    dialogsService.alert({
      message: err.message || err.error.message
    });
    await fireAuth.signOut();
    return router.parseUrl('/auth/sign-in');
  }
};
