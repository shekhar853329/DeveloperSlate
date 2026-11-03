import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProficiencyItem } from '../../../core/models/models';

@Component({
  selector: 'app-proficiencies',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] p-6 mb-6 shadow-sm">
      <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#1e293b]">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-cyan-500 text-[19px]">verified</span>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">
            Verified System Proficiencies
          </h3>
        </div>
        <span class="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20">
          Ranked & Algorithmic Benchmarked
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          *ngFor="let p of proficiencies"
          class="p-4 rounded-lg border border-slate-200 dark:border-[#1e293b] bg-slate-50/60 dark:bg-[#0d1117] hover:border-cyan-500/40 transition-colors flex flex-col justify-between"
        >
          <!-- Top Row: Icon + Title + Score -->
          <div class="flex items-start justify-between gap-3 mb-2.5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 dark:text-cyan-400">
                <span class="material-symbols-outlined text-[19px]">{{ p.icon }}</span>
              </div>
              <div>
                <span class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block">
                  {{ p.technology }}
                </span>
                <span class="text-[11px] font-mono font-medium text-cyan-600 dark:text-cyan-400">
                  {{ p.levelTitle || 'Specialist' }}
                </span>
              </div>
            </div>

            <div class="text-right font-mono">
              <span class="text-sm font-bold text-cyan-500 dark:text-cyan-400 block">
                {{ p.score }}/100
              </span>
              <span class="text-[10px] text-slate-400 uppercase tracking-wider">
                {{ p.tier }}
              </span>
            </div>
          </div>

          <!-- Description -->
          <p *ngIf="p.description" class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            {{ p.description }}
          </p>

          <!-- Bottom Row: Solutions Count + Reputation Bonus -->
          <div class="flex items-center justify-between text-[11px] font-mono pt-2.5 border-t border-slate-200/60 dark:border-[#1e293b]/60">
            <span class="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <span class="material-symbols-outlined text-[13px]">check_circle</span>
              <span>{{ p.verifiedSolutionsCount }} verified solutions</span>
            </span>
            <span *ngIf="p.reputationBonus" class="text-cyan-600 dark:text-cyan-400 font-semibold">
              {{ p.reputationBonus }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProficienciesComponent {
  @Input() proficiencies: UserProficiencyItem[] = [];
}

