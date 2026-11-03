import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { GlobalErrorHandlerService } from './core/services/global-error-handler.service';
import { httpErrorInterceptor } from './core/services/http-error.interceptor';
import { authTokenInterceptor } from './core/services/auth-token.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideClientHydration(),
    // authTokenInterceptor must run first so the token is attached before error handling
    provideHttpClient(withFetch(), withInterceptors([authTokenInterceptor, httpErrorInterceptor])),
    { provide: ErrorHandler, useClass: GlobalErrorHandlerService }
  ]
};
