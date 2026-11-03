import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { ScreenPermissionStatus } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private authService = inject(AuthService);

  public userRoles = computed<string[]>(() => {
    const user = this.authService.currentUser();
    return user?.roles || ['Developer'];
  });

  public isAdmin = computed<boolean>(() => {
    const roles = this.userRoles();
    return roles.includes('Admin') || roles.includes('System Architect');
  });

  public permissionsMap = computed<Record<string, ScreenPermissionStatus>>(() => {
    const user = this.authService.currentUser();
    return user?.permissions || {};
  });

  /**
   * Check if current user has Read Only or Full access to a screen
   */
  public canRead(screenKey: string): boolean {
    if (this.isAdmin()) return true;

    const perms = this.permissionsMap();
    if (perms[screenKey]) {
      return perms[screenKey].canRead;
    }

    // Default fallbacks for standard roles if permissions not yet received
    const roles = this.userRoles();
    if (roles.includes('Maintainer')) {
      return true; // Maintainer can read all screens
    }
    if (roles.includes('Developer')) {
      // Developers can't view admin screens by default
      if (screenKey === 'roles-management' || screenKey === 'users-management') {
        return false;
      }
      return true;
    }
    if (roles.includes('Viewer')) {
      if (['questions', 'blogs', 'tags', 'diff', 'ast', 'profile'].includes(screenKey)) {
        return true;
      }
      return false;
    }

    return true;
  }

  /**
   * Check if current user has Write / Mutate access on a screen
   */
  public canWrite(screenKey: string): boolean {
    if (this.isAdmin()) return true;

    const perms = this.permissionsMap();
    if (perms[screenKey]) {
      return perms[screenKey].canWrite;
    }

    const roles = this.userRoles();
    if (roles.includes('Maintainer')) {
      if (screenKey === 'roles-management' || screenKey === 'users-management') {
        return false; // Maintainer cannot write admin roles by default
      }
      return true;
    }
    if (roles.includes('Developer')) {
      // Developers can write on problem questions, studio, notebook, chat, profile
      return ['questions', 'studio', 'notebook', 'chat', 'profile'].includes(screenKey);
    }
    if (roles.includes('Viewer')) {
      return false; // Viewers have zero write access
    }

    return false;
  }

  /**
   * Check if user has a specific named role
   */
  public hasRole(roleName: string): boolean {
    return this.userRoles().includes(roleName);
  }
}

