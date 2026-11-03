import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileVerifiedSolutionItem } from '../../../core/models/models';

@Component({
  selector: 'app-verified-solutions-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-4 mb-8">
      <div
        *ngFor="let solution of solutions"
        class="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] p-5 sm:p-6 shadow-sm hover:border-cyan-500/50 transition-colors"
      >
        <!-- Card Header: Title & Verification Badges -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
          <div>
            <h4 class="text-base font-bold text-slate-900 dark:text-white leading-snug hover:text-cyan-500 transition-colors cursor-pointer">
              {{ solution.title }}
            </h4>
            <div class="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span class="material-symbols-outlined text-[15px]">verified</span>
                <span>{{ solution.verificationBadge }}</span>
              </span>
              <span>•</span>
              <span>{{ solution.solvedTimeAgo }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="px-2.5 py-1 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Accepted Solution
            </span>
          </div>
        </div>

        <!-- Code Preview Box -->
        <div class="rounded-lg bg-[#0d1117] border border-[#1e293b] p-4 font-mono text-xs overflow-x-auto text-slate-200 my-3.5 shadow-inner">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-[#1e293b] text-[10px] text-slate-500 uppercase tracking-wider">
            <span>Verified Implementation Snippet</span>
            <span class="text-cyan-400">Rust / Systems</span>
          </div>
          <pre class="leading-relaxed"><code>{{ solution.codeSnippet }}</code></pre>
        </div>

        <!-- Footer: Tags & Telemetry -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs font-mono">
          <!-- Tags -->
          <div class="flex flex-wrap items-center gap-1.5">
            <span
              *ngFor="let tag of solution.tags"
              class="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-[#0d1117] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e293b]"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px] text-emerald-500">thumb_up</span>
              <span>{{ solution.upvotes }} upvotes</span>
            </span>
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[15px] text-cyan-500">visibility</span>
              <span>{{ solution.views | number }} views</span>
            </span>
            <button class="text-cyan-500 hover:text-cyan-400 flex items-center gap-0.5 font-medium ml-1">
              <span>Inspect</span>
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VerifiedSolutionsFeedComponent {
  @Input() solutions: ProfileVerifiedSolutionItem[] = [];
}

