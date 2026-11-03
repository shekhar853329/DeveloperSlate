import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tag-badge',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <a
      [routerLink]="['/questions']"
      [queryParams]="{ tag: slug || name.toLowerCase() }"
      class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono border border-slate-200 dark:border-[#1e293b] bg-slate-100 dark:bg-[#111827] text-slate-700 dark:text-[#94a3b8] hover:text-cyan-600 dark:hover:text-[#38bdf8] hover:border-cyan-500/40 transition-all duration-150"
    >
      <span class="w-1.5 h-1.5 rounded-full" [style.backgroundColor]="accentColor || '#38bdf8'"></span>
      <span>{{ name }}</span>
      <span *ngIf="count" class="text-slate-400 dark:text-slate-500 text-[10px]">({{ count }})</span>
    </a>
  `
})
export class TagBadgeComponent {
  @Input() name = '';
  @Input() slug = '';
  @Input() accentColor = '#38bdf8';
  @Input() count?: number;
}

@Component({
  selector: 'app-solved-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium border border-emerald-600/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    >
      <span class="material-symbols-outlined text-[14px]">check_circle</span>
      <span>{{ label }}</span>
    </span>
  `
})
export class SolvedBadgeComponent {
  @Input() label = 'Solved';
}

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-flex flex-shrink-0" [style.width.px]="size" [style.height.px]="size">
      <img
        [src]="avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'"
        [alt]="displayName || username"
        class="w-full h-full rounded object-cover border border-slate-300 dark:border-[#1e293b]"
      />
      <span
        *ngIf="showStatus"
        class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0b0f17]"
        [class.bg-emerald-500]="isOnline"
        [class.bg-slate-400]="!isOnline"
      ></span>
    </div>
  `
})
export class UserAvatarComponent {
  @Input() avatarUrl = '';
  @Input() username = '';
  @Input() displayName = '';
  @Input() size = 32;
  @Input() showStatus = false;
  @Input() isOnline = true;
}

