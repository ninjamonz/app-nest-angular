import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { DialogsService } from '../dialogs/dialogs.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const dialogsService = inject(DialogsService);

  if (authService.hasPermission(route.data['permission'])) {
    return true;
  }

  dialogsService.alert({
    message: `Forbidden.`
  });
  return router.parseUrl('/');
};
