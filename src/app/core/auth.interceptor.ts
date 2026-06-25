import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from './auth.service';

// Shared refresh state so concurrent 401s wait for a single refresh call.
let refreshing = false;
const refreshed$ = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Don't attach tokens to the auth endpoints themselves.
  const isAuthCall = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  const withAuth = (token: string | null) =>
    token && !isAuthCall
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(withAuth(auth.accessToken)).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthCall || !auth.refreshToken) {
        return throwError(() => err);
      }

      if (refreshing) {
        return refreshed$.pipe(
          filter((t) => t !== null),
          take(1),
          switchMap((t) => next(withAuth(t)))
        );
      }

      refreshing = true;
      refreshed$.next(null);
      return auth.refresh().pipe(
        switchMap((res) => {
          refreshing = false;
          refreshed$.next(res.access);
          return next(withAuth(res.access));
        }),
        catchError((refreshErr) => {
          refreshing = false;
          auth.clear();
          router.navigate(['/login']);
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
