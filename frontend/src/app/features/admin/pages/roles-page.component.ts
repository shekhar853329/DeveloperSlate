import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { PermissionService } from '../../../core/services/permission.service';
import { RoleItem, RoleScreenPermissionItem, ScreenDefinition } from '../../../core/models/models';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-[#1e293b]">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-cyan-500 text-[22px]">admin_panel_settings</span>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Roles & Screen Permissions
            </h1>
          </div>
          <p class="text-xs font-mono text-slate-500 dark:text-slate-400">
            Define security roles, configure granular Read-Only and Write-Access permissions for each screen, and enforce RBAC policies.
          </p>
        </div>

        <button
          (click)="openCreateModal()"
          class="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-medium flex items-center gap-2 shadow-sm transition-colors self-start sm:self-auto"
        >
          <span class="material-symbols-outlined text-[16px]">add_moderator</span>
          <span>Create New Role</span>
        </button>
      </div>

      <!-- Main Layout: Left = Role List, Right = Screen Permission Matrix -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left: Role Selector (3 cols) -->
        <div class="lg:col-span-4 space-y-3">
          <div class="flex items-center justify-between px-1 text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">
            <span>Configured Roles</span>
            <span>{{ roles().length }} Roles</span>
          </div>

          <!-- Loading state -->
          <div *ngIf="isLoadingRoles()" class="flex items-center gap-2 px-2 py-4 text-xs font-mono text-slate-400">
            <span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            Loading roles…
          </div>

          <!-- Error state -->
          <div *ngIf="rolesLoadError()" class="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-xs font-mono">
            <div class="flex items-start gap-2 text-rose-400 mb-3">
              <span class="material-symbols-outlined text-[16px] mt-0.5">error</span>
              <span>{{ rolesLoadError() }}</span>
            </div>
            <button
              (click)="loadRoles()"
              class="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-mono font-medium transition-colors flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[13px]">refresh</span>
              Retry
            </button>
          </div>

          <!-- Empty state (loaded successfully but no roles in DB) -->
          <div *ngIf="!isLoadingRoles() && !rolesLoadError() && roles().length === 0"
               class="rounded-xl border border-dashed border-slate-300 dark:border-[#1e293b] p-6 text-center">
            <span class="material-symbols-outlined text-slate-400 text-[32px] mb-2 block">shield_question</span>
            <p class="text-xs font-mono text-slate-500 dark:text-slate-400 mb-3">
              No roles found in the database.<br>
              Restart the backend to re-run the seeder.
            </p>
            <button
              (click)="loadRoles()"
              class="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/30 text-[11px] font-mono font-medium transition-colors flex items-center gap-1 mx-auto"
            >
              <span class="material-symbols-outlined text-[13px]">refresh</span>
              Refresh
            </button>
          </div>

          <div class="space-y-2">
            <div
              *ngFor="let role of roles()"
              (click)="selectRole(role)"
              class="p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between"
              [class.border-cyan-500]="selectedRole()?.id === role.id"
              [class.bg-cyan-500/5]="selectedRole()?.id === role.id && !themeServiceIsDark()"
              [class.bg-cyan-950/20]="selectedRole()?.id === role.id && themeServiceIsDark()"
              [class.border-slate-200]="selectedRole()?.id !== role.id"
              [class.dark:border-[#1e293b]]="selectedRole()?.id !== role.id"
              [class.bg-white]="selectedRole()?.id !== role.id"
              [class.dark:bg-[#111827]]="selectedRole()?.id !== role.id"
            >
              <div class="flex items-start justify-between gap-2 mb-1.5">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-slate-900 dark:text-white">{{ role.name }}</span>
                  <span
                    *ngIf="role.isSystemRole"
                    class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  >
                    SYSTEM
                  </span>
                </div>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-[#1e293b] text-slate-600 dark:text-slate-300">
                  {{ role.userCount }} users
                </span>
              </div>

              <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                {{ role.description }}
              </p>

              <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1e293b]/60 text-[11px] font-mono text-slate-400">
                <span class="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                  <span class="material-symbols-outlined text-[13px]">tune</span>
                  <span>{{ getActiveScreensCount(role) }} screens configured</span>
                </span>
                <span class="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Screen Permission Matrix (8 cols) -->
        <div class="lg:col-span-8">
          <div *ngIf="selectedRole() as role" class="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] p-5 sm:p-6 shadow-sm">
            <!-- Role Header Info & Action Controls -->
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 mb-5 border-b border-slate-100 dark:border-[#1e293b]">
              <div class="space-y-1">
                <div class="flex items-center gap-2.5">
                  <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                    {{ role.name }} Role Permissions
                  </h2>
                  <span
                    *ngIf="role.isSystemRole"
                    class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  >
                    Protected System Role
                  </span>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
                  {{ role.description }}
                </p>
              </div>

              <!-- Save & Delete Actions -->
              <div class="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
                <button
                  *ngIf="!role.isSystemRole"
                  (click)="deleteCurrentRole()"
                  class="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-mono font-medium flex items-center gap-1 transition-colors"
                >
                  <span class="material-symbols-outlined text-[15px]">delete</span>
                  <span>Delete Role</span>
                </button>
                <button
                  (click)="saveRolePermissions()"
                  [disabled]="isSaving()"
                  class="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-mono font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                  <span class="material-symbols-outlined text-[16px]">save</span>
                  <span>{{ isSaving() ? 'Saving...' : 'Save Permissions' }}</span>
                </button>
              </div>
            </div>

            <!-- Bulk Toggle Helper Bar -->
            <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-[#0d1117] p-3 rounded-lg border border-slate-200 dark:border-[#1e293b] mb-5 text-xs font-mono">
              <span class="text-slate-500 dark:text-slate-400 font-medium">Quick Permission Helpers:</span>
              <div class="flex items-center gap-2">
                <button
                  (click)="setAllPermissions(true, true)"
                  class="px-2.5 py-1 rounded bg-white dark:bg-[#1e293b] text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-transparent hover:border-cyan-500/40 text-[11px]"
                >
                  Grant All (Read & Write)
                </button>
                <button
                  (click)="setAllPermissions(true, false)"
                  class="px-2.5 py-1 rounded bg-white dark:bg-[#1e293b] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-transparent hover:border-slate-400 text-[11px]"
                >
                  Read Only for All
                </button>
                <button
                  (click)="setAllPermissions(false, false)"
                  class="px-2.5 py-1 rounded bg-white dark:bg-[#1e293b] text-rose-500 border border-slate-200 dark:border-transparent hover:border-rose-400 text-[11px]"
                >
                  Revoke All Access
                </button>
              </div>
            </div>

            <!-- Feedback Notice -->
            <div *ngIf="saveSuccessMessage()" class="p-3 mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{{ saveSuccessMessage() }}</span>
            </div>

            <!-- Screen Permission Matrix Table -->             
            <div class="space-y-6">
              <div *ngFor="let group of groupedScreens()" class="space-y-2">
                <div class="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 font-bold px-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                  <span>{{ group.category }}</span>
                </div>

                <div class="rounded-lg border border-slate-200 dark:border-[#1e293b] overflow-hidden">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-50 dark:bg-[#0d1117] border-b border-slate-200 dark:border-[#1e293b] font-mono text-[11px] text-slate-500">
                      <tr>
                        <th class="py-2.5 px-4 font-semibold">Screen / Domain updated</th>
                        <th class="py-2.5 px-4 w-32 text-center font-semibold">
                          <span class="flex items-center justify-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">visibility</span>
                            <span>Read Only</span>
                          </span>
                        </th>
                        <th class="py-2.5 px-4 w-32 text-center font-semibold">
                          <span class="flex items-center justify-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">edit</span>
                            <span>Write Access</span>
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-[#1e293b]">
                      <tr
                        *ngFor="let perm of group.permissions"
                        class="hover:bg-slate-50/50 dark:hover:bg-[#161f30]/40 transition-colors"
                      >
                        <td class="py-3 px-4">
                          <div class="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{{ perm.screenName }}</span>
                            <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 dark:bg-[#1e293b] text-cyan-600 dark:text-cyan-400">
                              #{{ perm.screenKey }}
                            </span>
                          </div>
                          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                            {{ perm.description }}
                          </p>
                        </td>

                        <!-- Checkbox: Read Only -->
                        <td class="py-3 px-4 text-center">
                          <label class="inline-flex items-center justify-center cursor-pointer p-1">
                            <input
                              type="checkbox"
                              [checked]="perm.canRead"
                              (change)="onReadToggle(perm, $event)"
                              class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-cyan-600 focus:ring-cyan-500 bg-white dark:bg-[#0d1117]"
                            />
                          </label>
                        </td>

                        <!-- Checkbox: Write Access -->
                        <td class="py-3 px-4 text-center">
                          <label class="inline-flex items-center justify-center cursor-pointer p-1">
                            <input
                              type="checkbox"
                              [checked]="perm.canWrite"
                              (change)="onWriteToggle(perm, $event)"
                              class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-[#0d1117]"
                            />
                          </label>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Role Modal -->
      <div
        *ngIf="showCreateModal()"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <div class="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] max-w-md w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e293b]">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-cyan-500 text-[20px]">add_moderator</span>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Create Security Role</h3>
            </div>
            <button (click)="closeCreateModal()" class="text-slate-400 hover:text-slate-200">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div class="space-y-3 font-mono text-xs">
            <div>
              <label class="block text-slate-600 dark:text-slate-300 font-medium mb-1">Role Name *</label>
              <input
                type="text"
                [(ngModel)]="newRoleName"
                placeholder="e.g. Security Auditor, QA Engineer"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label class="block text-slate-600 dark:text-slate-300 font-medium mb-1">Description</label>
              <textarea
                [(ngModel)]="newRoleDescription"
                rows="3"
                placeholder="Scope of access privileges and operational duties..."
                class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white outline-none focus:border-cyan-500 leading-relaxed"
              ></textarea>
            </div>

            <div>
              <label class="block text-slate-600 dark:text-slate-300 font-medium mb-1">Starter Template</label>
              <select
                [(ngModel)]="newRoleTemplate"
                class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white outline-none focus:border-cyan-500"
              >
                <option value="developer">Developer Default (Feeds Read/Write, Admin Denied)</option>
                <option value="maintainer">Maintainer Default (Full Feeds, Admin Read-Only)</option>
                <option value="viewer">Viewer Default (Public Feeds Read-Only, No Write)</option>
                <option value="blank">Blank Slate (All Denied)</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#1e293b]">
            <button
              (click)="closeCreateModal()"
              class="px-4 py-2 rounded-lg border border-slate-200 dark:border-[#1e293b] text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1e293b] text-xs font-mono"
            >
              Cancel
            </button>
            <button
              (click)="submitCreateRole()"
              [disabled]="!newRoleName.trim() || isSubmittingRole()"
              class="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-mono font-medium flex items-center gap-1 shadow-sm"
            >
              <span>{{ isSubmittingRole() ? 'Creating...' : 'Create Role' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RolesPageComponent implements OnInit {
  private apiService = inject(AdminApiService);
  private permissionService = inject(PermissionService);

  roles = signal<RoleItem[]>([]);
  selectedRole = signal<RoleItem | null>(null);
  screensCatalog = signal<ScreenDefinition[]>([]);
  isSaving = signal<boolean>(false);
  saveSuccessMessage = signal<string | null>(null);
  isLoadingRoles = signal<boolean>(false);
  rolesLoadError = signal<string | null>(null);

  // Create Role Modal
  showCreateModal = signal<boolean>(false);
  newRoleName = '';
  newRoleDescription = '';
  newRoleTemplate = 'developer';
  isSubmittingRole = signal<boolean>(false);

  ngOnInit(): void {
    this.loadRoles();
    this.apiService.getAvailableScreens().subscribe(screens => {
      this.screensCatalog.set(screens);
    });
  }

  loadRoles(): void {
    this.isLoadingRoles.set(true);
    this.rolesLoadError.set(null);
    this.apiService.getRoles().subscribe({
      next: roles => {
        this.isLoadingRoles.set(false);
        this.roles.set(roles);
        if (roles.length > 0 && !this.selectedRole()) {
          this.selectedRole.set(roles[0]);
        } else if (this.selectedRole()) {
          const found = roles.find(r => r.id === this.selectedRole()!.id);
          if (found) this.selectedRole.set(found);
        }
      },
      error: (err) => {
        this.isLoadingRoles.set(false);
        const status = err?.status;
        if (status === 0) {
          this.rolesLoadError.set('Cannot reach the backend. Make sure the API server is running.');
        } else if (status === 401) {
          this.rolesLoadError.set('Session expired. Please log in again.');
        } else if (status === 403) {
          this.rolesLoadError.set('Access denied. Admin role required.');
        } else {
          this.rolesLoadError.set(`Failed to load roles (HTTP ${status ?? 'unknown'}). Check the backend logs.`);
        }
      }
    });
  }

  selectRole(role: RoleItem): void {
    this.selectedRole.set(role);
    this.saveSuccessMessage.set(null);
  }

  themeServiceIsDark(): boolean {
    return true; // matches Obsidian Terminal dark default
  }

  getActiveScreensCount(role: RoleItem): number {
    return role.permissions.filter(p => p.canRead).length;
  }

  groupedScreens(): { category: string; permissions: RoleScreenPermissionItem[] }[] {
    const role = this.selectedRole();
    if (!role) return [];

    const map = new Map<string, RoleScreenPermissionItem[]>();
    for (const perm of role.permissions) {
      const cat = perm.screenCategory || 'General';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(perm);
    }

    return Array.from(map.entries()).map(([category, permissions]) => ({
      category,
      permissions
    }));
  }

  onReadToggle(perm: RoleScreenPermissionItem, event: Event): void {
    perm.canRead = (event.target as HTMLInputElement).checked;
    // If read is unchecked, write must also be unchecked
    if (!perm.canRead) {
      perm.canWrite = false;
    }
  }

  onWriteToggle(perm: RoleScreenPermissionItem, event: Event): void {
    perm.canWrite = (event.target as HTMLInputElement).checked;
    // If write is enabled, read must automatically be enabled
    if (perm.canWrite) {
      perm.canRead = true;
    }
  }

  setAllPermissions(canRead: boolean, canWrite: boolean): void {
    const role = this.selectedRole();
    if (!role) return;

    for (const perm of role.permissions) {
      perm.canRead = canRead;
      perm.canWrite = canWrite;
    }
  }

  saveRolePermissions(): void {
    const role = this.selectedRole();
    if (!role) return;

    this.isSaving.set(true);
    this.saveSuccessMessage.set(null);

    const payload = {
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(p => ({
        screenKey: p.screenKey,
        canRead: p.canRead,
        canWrite: p.canWrite
      }))
    };

    this.apiService.updateRole(role.id, payload).subscribe({
      next: (updatedRole) => {
        this.isSaving.set(false);
        this.saveSuccessMessage.set(`Permissions for role "${role.name}" updated successfully in PostgreSQL database!`);
        this.loadRoles();
        setTimeout(() => this.saveSuccessMessage.set(null), 4000);
      },
      error: () => {
        this.isSaving.set(false);
        this.saveSuccessMessage.set(`Updated in-memory session (mock fallback).`);
        setTimeout(() => this.saveSuccessMessage.set(null), 4000);
      }
    });
  }

  deleteCurrentRole(): void {
    const role = this.selectedRole();
    if (!role || role.isSystemRole) return;

    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

    this.apiService.deleteRole(role.id).subscribe({
      next: () => {
        this.selectedRole.set(null);
        this.loadRoles();
      }
    });
  }

  openCreateModal(): void {
    this.newRoleName = '';
    this.newRoleDescription = '';
    this.newRoleTemplate = 'developer';
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitCreateRole(): void {
    if (!this.newRoleName.trim()) return;

    this.isSubmittingRole.set(true);
    const catalog = this.screensCatalog();

    const permissions = catalog.map(s => {
      let canRead = false;
      let canWrite = false;

      if (this.newRoleTemplate === 'maintainer') {
        canRead = true;
        canWrite = !['roles-management', 'users-management'].includes(s.key);
      } else if (this.newRoleTemplate === 'developer') {
        canRead = !['roles-management', 'users-management'].includes(s.key);
        canWrite = ['questions', 'studio', 'notebook', 'chat', 'profile'].includes(s.key);
      } else if (this.newRoleTemplate === 'viewer') {
        canRead = ['questions', 'blogs', 'tags', 'diff', 'ast', 'profile'].includes(s.key);
        canWrite = false;
      }

      return {
        screenKey: s.key,
        canRead,
        canWrite
      };
    });

    this.apiService.createRole({
      name: this.newRoleName.trim(),
      description: this.newRoleDescription.trim(),
      permissions
    }).subscribe({
      next: (created) => {
        this.isSubmittingRole.set(false);
        this.closeCreateModal();
        this.loadRoles();
        this.selectedRole.set(created);
      },
      error: () => {
        this.isSubmittingRole.set(false);
        this.closeCreateModal();
        this.loadRoles();
      }
    });
  }
}

