import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PermissionService } from '../../services/permission.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-60 flex-shrink-0 hidden md:block py-6 pr-4 border-r border-slate-200 dark:border-[#1e293b] select-none text-xs">
      
      <!-- Section 1: Main Platform Feeds -->
      <div class="mb-6">
        <h4 class="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
          Platform Feeds
        </h4>
        <nav class="space-y-1">
          <a
            *ngIf="permissionService.canRead('questions')"
            routerLink="/questions"
            routerLinkActive="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-l-2 border-cyan-500 font-semibold"
            class="flex items-center gap-2.5 px-3 py-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182234] hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">terminal</span>
            <span>Problem Explorer</span>
          </a>

          <a
            *ngIf="permissionService.canRead('blogs')"
            routerLink="/blogs"
            routerLinkActive="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-l-2 border-cyan-500 font-semibold"
            class="flex items-center gap-2.5 px-3 py-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182234] hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">auto_stories</span>
            <span>Engineering Blogs</span>
          </a>

          <a
            *ngIf="permissionService.canRead('tags')"
            routerLink="/tags"
            routerLinkActive="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-l-2 border-cyan-500 font-semibold"
            class="flex items-center gap-2.5 px-3 py-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182234] hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">tag</span>
            <span>Technology Tags</span>
          </a>
        </nav>
      </div>

      <!-- Section 2: Developer Tools & Workbenches -->
      <div class="mb-6">
        <h4 class="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
          Workbench & Tools
        </h4>
        <nav class="space-y-1">
          <a
            *ngIf="permissionService.canRead('studio')"
            routerLink="/studio"
            routerLinkActive="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-l-2 border-cyan-500 font-semibold"
            class="flex items-center gap-2.5 px-3 py-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182234] hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">edit_note</span>
            <span>Publishing Studio</span>
          </a>

          <a
            *ngIf="permissionService.canRead('notebook')"
            routerLink="/notebook"
            routerLinkActive="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-l-2 border-cyan-500 font-semibold"
            class="flex items-center gap-2.5 px-3 py-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182234] hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">folder_special</span>
            <span>Code Notebook Vault</span>
          </a>

          <a
            *ngIf="permissionService.canRead('diff')"
            routerLink="/diff"
            routerLinkActive="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-l-2 border-cyan-500 font-semibold"
            class="flex items-center gap-2.5 px-3 py-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182234] hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">difference</span>
            <span>Code Diff Viewer</span>
          </a>

          <a
            *ngIf="permissionService.canRead('ast')"
            routerLink="/ast"
            routerLinkActive="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-l-2 border-cyan-500 font-semibold"
            class="flex items-center gap-2.5 px-3 py-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182234] hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">account_tree</span>
            <span>AST Visualizer</span>
          </a>
        </nav>
      </div>

      <!-- Section 3: Collaboration & Profile -->
      <div class="mb-6">
        <h4 class="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">
          Real-time & Identity
        </h4>
        <nav class="space-y-1">
          <a
            *ngIf="permissionService.canRead('chat')"
            routerLink="/chat"
            routerLinkActive="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-l-2 border-cyan-500 font-semibold"
            class="flex items-center justify-between px-3 py-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182234] hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            <div class="flex items-center gap-2.5">
              <span class="material-symbols-outlined text-[18px]">forum</span>
              <span>Live Channels</span>
            </div>
            <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-500 font-bold">LIVE</span>
          </a>

          <a
            *ngIf="permissionService.canRead('profile')"
            [routerLink]="['/profile', authService.currentUser()?.username]"
            routerLinkActive="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-l-2 border-cyan-500 font-semibold"
            class="flex items-center gap-2.5 px-3 py-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182234] hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">badge</span>
            <span>Developer Profile</span>
          </a>
        </nav>
      </div>

      <!-- Section 4: Security & Administration (RBAC) -->
      <div *ngIf="permissionService.canRead('roles-management') || permissionService.canRead('users-management') || permissionService.isAdmin()" class="mb-6">
        <h4 class="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-cyan-500/80 font-semibold flex items-center justify-between">
          <span>Security & RBAC</span>
          <span class="material-symbols-outlined text-[14px]">shield</span>
        </h4>
        <nav class="space-y-1">
          <a
            *ngIf="permissionService.canRead('roles-management') || permissionService.isAdmin()"
            routerLink="/admin/roles"
            routerLinkActive="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-l-2 border-cyan-500 font-semibold"
            class="flex items-center gap-2.5 px-3 py-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182234] hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">admin_panel_settings</span>
            <span>Role Permissions</span>
          </a>

          <a
            *ngIf="permissionService.canRead('users-management') || permissionService.isAdmin()"
            routerLink="/admin/users"
            routerLinkActive="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-l-2 border-cyan-500 font-semibold"
            class="flex items-center gap-2.5 px-3 py-2 rounded text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182234] hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">manage_accounts</span>
            <span>Assign User Roles</span>
          </a>
        </nav>
      </div>

      <!-- Telemetry Box -->
      <div class="p-3 mx-2 rounded border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-[11px] font-mono text-slate-500 dark:text-slate-400 space-y-1.5">
        <div class="flex items-center justify-between">
          <span>Active Role:</span>
          <span class="text-cyan-400 font-bold">{{ permissionService.userRoles()[0] || 'Developer' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span>PostgreSQL RBAC:</span>
          <span class="text-emerald-500">Enforced</span>
        </div>
        <div class="flex items-center justify-between">
          <span>SignalR Hub:</span>
          <span class="text-cyan-400">Online</span>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  public permissionService = inject(PermissionService);
  public authService = inject(AuthService);
}
