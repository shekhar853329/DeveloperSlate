import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Auth endpoints manage their own error display — skip all interceptor side-effects for them
      const isAuthEndpoint = req.url.includes('/api/auth/login') ||
                             req.url.includes('/api/auth/register') ||
                             req.url.includes('/api/auth/refresh');

      if (!isAuthEndpoint) {
        switch (error.status) {
          case 0:
            toast.error('Cannot reach the server. Check your connection.');
            break;
          case 401:
            // Token expired mid-session: clear state and redirect to login
            auth.logout();
            break;
          case 403:
            toast.error('You don\'t have permission to do that.');
            break;
          case 404:
            // Let components handle 404s individually
            break;
          case 429:
            toast.warning('Too many requests. Please slow down.');
            break;
          case 500:
          case 502:
          case 503:
            toast.error('Server error. Please try again in a moment.');
            break;
          default:
            if (error.status >= 400) {
              const msg = error.error?.message || error.message || 'An unexpected error occurred.';
              toast.error(msg);
            }
        }
      }

      // Always re-throw so the calling service/component can react further
      return throwError(() => error);
    })
  );
};
