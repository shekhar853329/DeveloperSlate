import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../../core/services/admin-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { RoleItem, UserWithRolesItem } from '../../../core/models/models';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-[#1e293b]">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-cyan-500 text-[22px]">manage_accounts</span>
            <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              User Roles & Permissions Assignment
            </h1>
          </div>
          <p class="text-xs font-mono text-slate-500 dark:text-slate-400">
            Manage registered engineers, attach security roles to user contexts, and inspect effective screen access rights.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#111827] text-xs font-mono text-slate-600 dark:text-slate-300">
            Active Registry: <strong>{{ users().length }} Developers</strong>
          </span>
        </div>
      </div>

      <!-- Telemetry Stats Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6 font-mono text-xs">
        <div class="p-3.5 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] shadow-sm">
          <span class="text-slate-400 text-[10px] uppercase tracking-wider block">Total Users</span>
          <span class="text-xl font-bold text-slate-900 dark:text-white mt-1 block">{{ users().length }}</span>
        </div>
        <div class="p-3.5 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] shadow-sm">
          <span class="text-slate-400 text-[10px] uppercase tracking-wider block">System Admins</span>
          <span class="text-xl font-bold text-cyan-500 mt-1 block">{{ getAdminsCount() }}</span>
        </div>
        <div class="p-3.5 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] shadow-sm">
          <span class="text-slate-400 text-[10px] uppercase tracking-wider block">Online Now</span>
          <span class="text-xl font-bold text-emerald-400 mt-1 block">{{ getOnlineCount() }}</span>
        </div>
        <div class="p-3.5 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] shadow-sm">
          <span class="text-slate-400 text-[10px] uppercase tracking-wider block">Configured Roles</span>
          <span class="text-xl font-bold text-amber-400 mt-1 block">{{ availableRoles().length }}</span>
        </div>
      </div>

      <!-- Filter / Search Toolbar -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#111827] p-3 rounded-xl border border-slate-200 dark:border-[#1e293b] mb-6 shadow-sm">
        <div class="relative w-full sm:w-80">
          <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[17px]">search</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="filterUsers()"
            placeholder="Search by username, name, or email..."
            class="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
          />
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto font-mono text-xs">
          <span class="text-slate-400 text-[11px]">Filter Role:</span>
          <select
            [(ngModel)]="selectedRoleFilter"
            (change)="filterUsers()"
            class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-xs font-mono text-slate-900 dark:text-white outline-none focus:border-cyan-500"
          >
            <option value="">All Roles</option>
            <option *ngFor="let r of availableRoles()" [value]="r.name">{{ r.name }}</option>
          </select>
        </div>
      </div>

      <!-- Status Toast Message -->
      <div *ngIf="actionSuccessMessage()" class="p-3 mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-mono flex items-center gap-2">
        <span class="material-symbols-outlined text-[16px]">check_circle</span>
        <span>{{ actionSuccessMessage() }}</span>
      </div>

      <!-- Users Grid / Table -->
      <div class="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-[#0d1117] border-b border-slate-200 dark:border-[#1e293b] font-mono text-[11px] text-slate-500 uppercase tracking-wider">
              <tr>
                <th class="py-3 px-4 font-semibold">Developer Identity</th>
                <th class="py-3 px-4 font-semibold">System Title</th>
                <th class="py-3 px-4 font-semibold">Reputation & Solved</th>
                <th class="py-3 px-4 font-semibold">Assigned Security Roles</th>
                <th class="py-3 px-4 text-right font-semibold">Role Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-[#1e293b]">
              <tr
                *ngFor="let user of filteredUsers()"
                class="hover:bg-slate-50/60 dark:hover:bg-[#161f30]/40 transition-colors"
              >
                <!-- User Identity -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <div class="relative flex-shrink-0">
                      <img
                        [src]="user.avatarUrl"
                        [alt]="user.displayName"
                        class="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-[#1e293b]"
                      />
                      <span
                        *ngIf="user.isOnline"
                        class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#111827]"
                        title="Online"
                      ></span>
                    </div>

                    <div>
                      <div class="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                        <span>{{ user.displayName }}</span>
                        <span
                          *ngIf="isCurrentUser(user)"
                          class="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-500 border border-cyan-500/30"
                        >
                          YOU
                        </span>
                      </div>
                      <span class="text-[11px] font-mono text-slate-400 block">&#64;{{ user.username }} • {{ user.email }}</span>
                    </div>
                  </div>
                </td>

                <!-- Title -->
                <td class="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                  <span>{{ user.title || 'Engineer' }}</span>
                </td>

                <!-- Reputation -->
                <td class="py-3.5 px-4 font-mono">
                  <span class="text-cyan-500 font-bold block">{{ user.reputation | number }} rep</span>
                  <span class="text-[10px] text-emerald-500">{{ user.solvedCount }} solved</span>
                </td>

                <!-- Assigned Roles -->
                <td class="py-3.5 px-4">
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span
                      *ngFor="let r of user.roles"
                      class="px-2 py-0.5 rounded text-[11px] font-mono font-medium flex items-center gap-1"
                      [class.bg-amber-500/10]="r.name === 'Admin'"
                      [class.text-amber-500]="r.name === 'Admin'"
                      [class.border]="r.name === 'Admin'"
                      [class.border-amber-500/30]="r.name === 'Admin'"
                      [class.bg-cyan-500/10]="r.name === 'Maintainer'"
                      [class.text-cyan-400]="r.name === 'Maintainer'"
                      [class.border-cyan-500/30]="r.name === 'Maintainer'"
                      [class.bg-slate-100]="r.name !== 'Admin' && r.name !== 'Maintainer'"
                      [class.dark:bg-[#1e293b]]="r.name !== 'Admin' && r.name !== 'Maintainer'"
                      [class.text-slate-700]="r.name !== 'Admin' && r.name !== 'Maintainer'"
                      [class.dark:text-slate-300]="r.name !== 'Admin' && r.name !== 'Maintainer'"
                    >
                      <span class="material-symbols-outlined text-[12px]">security</span>
                      <span>{{ r.name }}</span>
                    </span>

                    <span *ngIf="user.roles.length === 0" class="text-slate-400 text-xs italic">
                      No roles assigned (Default: Developer)
                    </span>
                  </div>
                </td>

                <!-- Actions: Assign Role & Switch Context -->
                <td class="py-3.5 px-4 text-right">
                  <div class="flex items-center justify-end gap-2 font-mono">
                    <button
                      (click)="openAssignModal(user)"
                      class="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-medium flex items-center gap-1 shadow-sm transition-colors"
                      title="Assign or change security roles"
                    >
                      <span class="material-symbols-outlined text-[14px]">edit_attributes</span>
                      <span>Assign Roles</span>
                    </button>

                    <button
                      *ngIf="!isCurrentUser(user)"
                      (click)="switchToUser(user)"
                      class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1e293b] hover:border-cyan-500 text-slate-600 dark:text-slate-300 hover:text-cyan-400 text-[11px] font-medium flex items-center gap-1 transition-colors"
                      title="Test app from this user's role context"
                    >
                      <span class="material-symbols-outlined text-[14px]">swap_horiz</span>
                      <span>Test Role</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Assign Roles Modal -->
      <div
        *ngIf="showAssignModal() && targetUser()"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <div class="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] max-w-md w-full p-6 shadow-2xl space-y-4 font-sans">
          <!-- Modal Header -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e293b]">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-cyan-500 text-[20px]">security</span>
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                  Assign Roles: {{ targetUser()!.displayName }}
                </h3>
                <span class="text-[11px] font-mono text-slate-400">&#64;{{ targetUser()!.username }}</span>
              </div>
            </div>
            <button (click)="closeAssignModal()" class="text-slate-400 hover:text-slate-200">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <!-- Roles Checkbox List -->
          <div class="space-y-2 py-1">
            <p class="text-xs text-slate-500 dark:text-slate-400 font-mono mb-2">
              Select one or more security roles to attach to this user context:
            </p>

            <div
              *ngFor="let role of availableRoles()"
              (click)="toggleRoleSelection(role.id)"
              class="p-3 rounded-lg border cursor-pointer transition-colors flex items-start gap-3"
              [class.border-cyan-500]="isRoleSelected(role.id)"
              [class.bg-cyan-500/5]="isRoleSelected(role.id)"
              [class.border-slate-200]="!isRoleSelected(role.id)"
              [class.dark:border-[#1e293b]]="!isRoleSelected(role.id)"
              [class.bg-slate-50]="!isRoleSelected(role.id)"
              [class.dark:bg-[#0d1117]]="!isRoleSelected(role.id)"
            >
              <input
                type="checkbox"
                [checked]="isRoleSelected(role.id)"
                class="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 text-cyan-600 focus:ring-cyan-500"
              />
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-xs text-slate-900 dark:text-white">{{ role.name }}</span>
                  <span
                    *ngIf="role.isSystemRole"
                    class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-500"
                  >
                    SYSTEM
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {{ role.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#1e293b] font-mono text-xs">
            <button
              (click)="closeAssignModal()"
              class="px-4 py-2 rounded-lg border border-slate-200 dark:border-[#1e293b] text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1e293b]"
            >
              Cancel
            </button>
            <button
              (click)="submitRoleAssignments()"
              [disabled]="isAssigning()"
              class="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium flex items-center gap-1 shadow-sm"
            >
              <span>{{ isAssigning() ? 'Saving...' : 'Apply Role Changes' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UsersPageComponent implements OnInit {
  private apiService = inject(AdminApiService);
  private authService = inject(AuthService);

  users = signal<UserWithRolesItem[]>([]);
  filteredUsers = signal<UserWithRolesItem[]>([]);
  availableRoles = signal<RoleItem[]>([]);

  searchQuery = '';
  selectedRoleFilter = '';
  actionSuccessMessage = signal<string | null>(null);

  // Modal State
  showAssignModal = signal<boolean>(false);
  targetUser = signal<UserWithRolesItem | null>(null);
  selectedRoleIds = signal<string[]>([]);
  isAssigning = signal<boolean>(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getUsersWithRoles().subscribe(users => {
      this.users.set(users);
      this.filterUsers();
    });

    this.apiService.getRoles().subscribe(roles => {
      this.availableRoles.set(roles);
    });
  }

  filterUsers(): void {
    let result = this.users();
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }

    if (this.selectedRoleFilter) {
      result = result.filter(u =>
        u.roles.some(r => r.name.toLowerCase() === this.selectedRoleFilter.toLowerCase())
      );
    }

    this.filteredUsers.set(result);
  }

  getAdminsCount(): number {
    return this.users().filter(u => u.roles.some(r => r.name === 'Admin')).length;
  }

  getOnlineCount(): number {
    return this.users().filter(u => u.isOnline).length;
  }

  isCurrentUser(user: UserWithRolesItem): boolean {
    const cur = this.authService.currentUser();
    return cur?.id === user.id || cur?.username === user.username;
  }

  openAssignModal(user: UserWithRolesItem): void {
    this.targetUser.set(user);
    this.selectedRoleIds.set(user.roles.map(r => r.id));
    this.showAssignModal.set(true);
  }

  closeAssignModal(): void {
    this.showAssignModal.set(false);
    this.targetUser.set(null);
  }

  isRoleSelected(roleId: string): boolean {
    return this.selectedRoleIds().includes(roleId);
  }

  toggleRoleSelection(roleId: string): void {
    const current = [...this.selectedRoleIds()];
    const idx = current.indexOf(roleId);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(roleId);
    }
    this.selectedRoleIds.set(current);
  }

  submitRoleAssignments(): void {
    const target = this.targetUser();
    if (!target) return;

    this.isAssigning.set(true);
    const roleIds = this.selectedRoleIds();

    this.apiService.assignUserRoles(target.id, roleIds).subscribe({
      next: (res) => {
        this.isAssigning.set(false);
        this.actionSuccessMessage.set(
          `Security roles for ${target.displayName} (@${target.username}) updated successfully in PostgreSQL!`
        );
        this.closeAssignModal();
        this.loadData();

        // If the current logged-in user was modified, update their active session context immediately!
        if (this.isCurrentUser(target)) {
          const updatedRoleNames = this.availableRoles()
            .filter(r => roleIds.includes(r.id))
            .map(r => r.name);

          const cur = this.authService.currentUser();
          if (cur) {
            this.authService.setCurrentUser({
              ...cur,
              roles: updatedRoleNames,
              permissions: res.effectivePermissions || cur.permissions
            });
          }
        }

        setTimeout(() => this.actionSuccessMessage.set(null), 5000);
      },
      error: () => {
        this.isAssigning.set(false);
        this.closeAssignModal();
        this.loadData();
      }
    });
  }

  switchToUser(user: UserWithRolesItem): void {
    const roleNames = user.roles.map(r => r.name);
    if (roleNames.length === 0) roleNames.push('Developer');

    this.authService.setCurrentUser({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      title: user.title,
      reputation: user.reputation,
      roles: roleNames,
      permissions: user.effectivePermissions
    });

    this.actionSuccessMessage.set(
      `Switched active session context to: ${user.displayName} (Roles: [${roleNames.join(', ')}]). Screen permissions updated!`
    );
    setTimeout(() => this.actionSuccessMessage.set(null), 5000);
  }
}

