import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, lastValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from '@angular/fire/auth';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  return from(handle(req, next));
};

// https://stackoverflow.com/a/57712118
export const handle = async (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const fireAuth = inject(Auth);

  await fireAuth.authStateReady();
  if (!fireAuth.currentUser) {
    return lastValueFrom(next(req));
  }

  const accessToken = 'Bearer ' + await fireAuth.currentUser.getIdToken();
  const newReq = req.clone({
    setHeaders: { Authorization: accessToken }
  });
  return lastValueFrom(next(newReq));
};
