import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SesionService } from '../services/sesion.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sesionService = inject(SesionService);
  const token = localStorage.getItem('token');

  let authReq = req;
  if (token && req.url.startsWith(environment.apiUrl) && !req.headers.has('Authorization')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/registro') &&
        !req.url.includes('/auth/autorizar')
      ) {
        sesionService.cerrarSesion();
      }
      return throwError(() => error);
    })
  );
};