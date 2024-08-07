import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Auth } from '@angular/fire/auth';

export const signInGuard: CanActivateFn = async (route, state) => {
  const fireAuth = inject(Auth);
  const authService = inject(AuthService);
  const router = inject(Router);

  await fireAuth.authStateReady();
  if (!fireAuth.currentUser) {
    authService.reset();
    return true;
  }
  return router.parseUrl('/');
};
