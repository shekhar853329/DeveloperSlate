import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { AuthService } from './auth.service';
import { API_BASE_URL } from '../config/api.config';

// Shared refresh state — prevents multiple concurrent 401s each firing their own refresh call.
let isRefreshing = false;
const refreshDone$ = new BehaviorSubject<string | null>(null);

/**
 * 1. Attaches the JWT Bearer token to every outgoing request.
 * 2. On 401, attempts a silent token refresh and retries the original request.
 *    Only logs the user out if the refresh itself fails.
 */
export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const isAuthEndpoint =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register') ||
    req.url.includes('/api/auth/github') ||
    req.url.includes('/api/auth/refresh');

  // Attach token (skip auth endpoints)
  const token = auth.authToken();
  const authedReq = token && !isAuthEndpoint ? addToken(req, token) : req;

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only intercept 401s on non-auth endpoints
      if (error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      const refreshToken = auth.refreshToken();
      if (!refreshToken) {
        // No refresh token stored — nothing we can do, let the error interceptor handle it
        return throwError(() => error);
      }

      if (isRefreshing) {
        // Another request already triggered refresh — wait for it to finish then retry
        return refreshDone$.pipe(
          filter(t => t !== null),
          take(1),
          switchMap(newToken => next(addToken(req, newToken!)))
        );
      }

      isRefreshing = true;
      refreshDone$.next(null);

      return auth.refreshAccessToken(refreshToken).pipe(
        switchMap(newToken => {
          isRefreshing = false;
          refreshDone$.next(newToken);
          return next(addToken(req, newToken));
        }),
        catchError(refreshErr => {
          // Refresh failed (token expired/revoked) — log out and surface the original 401
          isRefreshing = false;
          refreshDone$.next(null);
          auth.logout();
          return throwError(() => error);
        })
      );
    })
  );
};

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}
