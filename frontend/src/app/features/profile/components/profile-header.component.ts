import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileDetail } from '../../../core/models/models';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="profile" class="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] p-6 lg:p-8 mb-6 shadow-sm">
      <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <!-- User Info -->
        <div class="flex flex-col sm:flex-row items-start gap-5">
          <div class="relative flex-shrink-0">
            <img
              [src]="profile.avatarUrl"
              [alt]="profile.displayName"
              class="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border-2 border-cyan-500 shadow-lg shadow-cyan-500/10"
            />
            <span
              *ngIf="profile.isOnline"
              class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#111827] flex items-center justify-center"
              title="Online now"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            </span>
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {{ profile.displayName }}
              </h1>
              <span class="text-sm font-mono text-slate-500 dark:text-slate-400">
                &#64;{{ profile.username }}
              </span>
              <span class="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30 tracking-wide uppercase">
                Pro Maintainer
              </span>
              <span class="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span class="material-symbols-outlined text-[13px]">verified</span>
                <span>{{ profile.acceptanceRate }}% Acc. Rate</span>
              </span>
            </div>

            <p class="text-xs sm:text-sm font-mono text-cyan-600 dark:text-cyan-400 mb-2.5 font-medium">
              {{ profile.title }}
            </p>

            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mb-4">
              {{ profile.bio }}
            </p>

            <!-- Metadata Chips -->
            <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[15px] text-slate-400">location_on</span>
                <span>{{ profile.location }}</span>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[15px] text-slate-400">code</span>
                <a
                  [href]="'https://github.com/' + profile.githubHandle"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:text-cyan-500 transition-colors underline-offset-2 hover:underline"
                >
                  github.com/{{ profile.githubHandle }}
                </a>
              </span>
              <span class="flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[15px] text-slate-400">calendar_today</span>
                <span>Joined {{ profile.createdAt | date:'MMMM yyyy' }}</span>
              </span>
              <span class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span class="material-symbols-outlined text-[15px]">sync</span>
                <span>Continuous Telemetry Active</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex lg:flex-col items-center gap-2.5 flex-shrink-0 self-stretch lg:self-start">
          <button
            class="flex-1 lg:flex-none w-full px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-medium flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <span class="material-symbols-outlined text-[16px]">person_add</span>
            <span>Connect / Follow</span>
          </button>
          <button
            class="flex-1 lg:flex-none w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-[#1e293b] bg-slate-50 hover:bg-slate-100 dark:bg-[#0d1117] dark:hover:bg-[#1a2333] text-slate-700 dark:text-slate-200 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <span class="material-symbols-outlined text-[16px]">share</span>
            <span>Share Profile</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProfileHeaderComponent {
  @Input({ required: true }) profile!: ProfileDetail;
}

