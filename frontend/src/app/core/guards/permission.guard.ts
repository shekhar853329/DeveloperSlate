import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const permissionService = inject(PermissionService);
  const authService = inject(AuthService);
  const router = inject(Router);

  // If not authenticated, route to login
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const screenKey = route.data['screenKey'] as string;
  if (!screenKey) {
    return true; // No explicit screen key rule
  }

  if (permissionService.canRead(screenKey)) {
    return true;
  }

  // Access Denied: redirect to a dedicated, unguarded access-denied page.
  // DO NOT redirect to '/questions' — that route is also guarded and causes
  // an infinite navigation loop when the user lacks read access to 'questions'.
  console.warn(`[AccessControl] Access denied for screen: ${screenKey}. User roles:`, permissionService.userRoles());
  router.navigate(['/access-denied'], { queryParams: { screen: screenKey } });
  return false;
};

