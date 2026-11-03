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

  // Access Denied: redirect to default safe screen
  console.warn(`[AccessControl] Access denied for screen: ${screenKey}. User roles:`, permissionService.userRoles());
  router.navigate(['/questions'], { queryParams: { error: 'access_denied', screen: screenKey } });
  return false;
};

