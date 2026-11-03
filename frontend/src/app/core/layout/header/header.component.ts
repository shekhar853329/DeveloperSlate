import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle.component';
import { UserAvatarComponent } from '../../../shared/components/common-badges.component';
import { SignalrChatService } from '../../services/signalr-chat.service';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ThemeToggleComponent, UserAvatarComponent],
  template: `
    <header class="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-[#1e293b] bg-white/90 dark:bg-[#0b0f17]/90 backdrop-blur-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        <!-- Logo & Brand -->
        <div class="flex items-center gap-6">
          <a routerLink="/" class="flex items-center gap-2.5 group">
            <div class="w-9 h-9 rounded bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-500 font-mono font-bold text-base group-hover:border-cyan-400 group-hover:scale-105 transition-all">
              &gt;_
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-slate-900 dark:text-white tracking-tight text-base font-sans flex items-center gap-1.5">
                DeveloperSlate
                <span class="text-[10px] font-mono px-1.5 py-0.2 rounded border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10">v2.4</span>
              </span>
              <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400 -mt-0.5">Obsidian Terminal Hub</span>
            </div>
          </a>

          <!-- Quick Navigation Bar -->
          <nav class="hidden md:flex items-center gap-1 text-sm font-medium">
            <a
              routerLink="/questions"
              routerLinkActive="text-cyan-600 dark:text-cyan-400 bg-slate-100 dark:bg-[#182234]"
              class="px-3 py-1.5 rounded text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-[#182234]/60 transition-colors"
            >
              Questions
            </a>
            <a
              routerLink="/blogs"
              routerLinkActive="text-cyan-600 dark:text-cyan-400 bg-slate-100 dark:bg-[#182234]"
              class="px-3 py-1.5 rounded text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-[#182234]/60 transition-colors"
            >
              Articles
            </a>
            <a
              routerLink="/studio"
              routerLinkActive="text-cyan-600 dark:text-cyan-400 bg-slate-100 dark:bg-[#182234]"
              class="px-3 py-1.5 rounded text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-[#182234]/60 transition-colors"
            >
              Studio
            </a>
            <a
              routerLink="/chat"
              routerLinkActive="text-cyan-600 dark:text-cyan-400 bg-slate-100 dark:bg-[#182234]"
              class="px-3 py-1.5 rounded text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-50 dark:hover:bg-[#182234]/60 transition-colors flex items-center gap-1.5"
            >
              <span>Chat</span>
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </a>

            <!-- Admin Dropdown Menu -->
            <div
              *ngIf="permissionService.isAdmin() || permissionService.canRead('roles-management')"
              class="relative group"
            >
              <button
                type="button"
                class="px-3 py-1.5 rounded text-cyan-600 dark:text-cyan-400 hover:bg-slate-100 dark:hover:bg-[#182234] transition-colors flex items-center gap-1 font-semibold cursor-pointer"
              >
                <span class="material-symbols-outlined text-[17px]">shield</span>
                <span>Admin</span>
                <span class="material-symbols-outlined text-[14px] group-hover:rotate-180 transition-transform">expand_more</span>
              </button>

              <div class="absolute left-0 top-full mt-1 w-48 rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] shadow-xl py-1.5 hidden group-hover:block z-50">
                <a
                  routerLink="/admin/roles"
                  routerLinkActive="text-cyan-500 font-bold bg-cyan-500/10"
                  class="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a2333] transition-colors"
                >
                  <span class="material-symbols-outlined text-[16px] text-cyan-500">admin_panel_settings</span>
                  <span>Role Permissions</span>
                </a>
                <a
                  routerLink="/admin/users"
                  routerLinkActive="text-cyan-500 font-bold bg-cyan-500/10"
                  class="flex items-center gap-2 px-3.5 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a2333] transition-colors"
                >
                  <span class="material-symbols-outlined text-[16px] text-cyan-500">manage_accounts</span>
                  <span>Assign User Roles</span>
                </a>
              </div>
            </div>
          </nav>
        </div>

        <!-- Global Search Input -->
        <div class="flex-1 max-w-md mx-4 hidden lg:block">
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keydown.enter)="executeSearch()"
              placeholder="Search questions, syntax, tags, or articles... [/]"
              class="w-full pl-9 pr-8 py-1.5 text-xs font-mono rounded border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <span class="absolute right-2.5 top-2 px-1 rounded border border-slate-300 dark:border-[#334155] text-[10px] font-mono text-slate-400 select-none">
              /
            </span>
          </div>
        </div>

        <!-- Right Action Controls -->
        <div class="flex items-center gap-2.5">
          <!-- Real-Time SignalR Status Indicator -->
          <div
            class="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono border"
            [class.border-emerald-500-30]="signalrService.isConnected$ | async"
            [class.bg-emerald-500-10]="signalrService.isConnected$ | async"
            [class.text-emerald-500]="signalrService.isConnected$ | async"
            [class.border-slate-300]="!(signalrService.isConnected$ | async)"
            [class.text-slate-400]="!(signalrService.isConnected$ | async)"
            title="SignalR Hub Connection Status"
          >
            <span
              class="w-2 h-2 rounded-full"
              [class.bg-emerald-500]="signalrService.isConnected$ | async"
              [class.bg-slate-400]="!(signalrService.isConnected$ | async)"
            ></span>
            <span>{{ (signalrService.isConnected$ | async) ? 'SignalR Live' : 'SignalR Local' }}</span>
          </div>

          <!-- Theme Mode Toggle -->
          <app-theme-toggle></app-theme-toggle>

          <!-- Ask / New Post Trigger -->
          <a
            routerLink="/studio"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-sm transition-all"
          >
            <span class="material-symbols-outlined text-[16px]">edit_square</span>
            <span>Publish</span>
          </a>

          <!-- Quick Admin Action Badge (Always visible for Admin) -->
          <a
            *ngIf="permissionService.isAdmin() || permissionService.canRead('roles-management')"
            routerLink="/admin/roles"
            class="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-mono font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-sm transition-all"
            title="Security & RBAC Administration"
          >
            <span class="material-symbols-outlined text-[16px]">shield</span>
            <span class="hidden sm:inline">ADMIN</span>
          </a>

          <!-- User Profile / Auth State -->
          <ng-container *ngIf="authService.currentUser() as user; else loginButton">
            <div class="flex items-center gap-2">
              <a
                routerLink="/profile"
                class="flex items-center gap-2 pl-1 pr-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-[#182234] border border-transparent hover:border-slate-200 dark:hover:border-[#1e293b] transition-all"
              >
                <app-user-avatar
                  [avatarUrl]="user.avatarUrl"
                  [displayName]="user.displayName"
                  [size]="30"
                  [showStatus]="true"
                  [isOnline]="true"
                ></app-user-avatar>
                <div class="hidden xl:flex flex-col text-left">
                  <span class="text-xs font-medium text-slate-900 dark:text-slate-200 leading-tight">{{ user.displayName }}</span>
                  <span class="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 leading-none">{{ user.reputation }} rep</span>
                </div>
              </a>

              <!-- Logout Button -->
              <button
                type="button"
                (click)="authService.logout()"
                class="w-8 h-8 rounded border border-slate-200 dark:border-[#1e293b] flex items-center justify-center text-slate-400 hover:text-rose-400 hover:border-rose-400/50 transition-colors"
                title="Sign Out / Disconnect Terminal"
              >
                <span class="material-symbols-outlined text-[16px]">logout</span>
              </button>
            </div>
          </ng-container>

          <ng-template #loginButton>
            <a
              routerLink="/login"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-semibold border border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all"
            >
              <span class="material-symbols-outlined text-[16px]">login</span>
              <span>Sign In</span>
            </a>
          </ng-template>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  public signalrService = inject(SignalrChatService);
  public authService = inject(AuthService);
  public permissionService = inject(PermissionService);
  private router = inject(Router);

  public searchQuery = '';

  executeSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/questions'], { queryParams: { search: this.searchQuery.trim() } });
    }
  }
}
