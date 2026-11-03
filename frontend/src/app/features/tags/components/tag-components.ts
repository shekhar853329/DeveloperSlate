import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TagSummary } from '../../../core/models/models';

@Component({
  selector: 'app-tag-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="group rounded border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-[#334155] transition-all"
    >
      <div>
        <!-- Card Header -->
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="flex items-center gap-2">
            <div
              class="w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-xs"
              [style.backgroundColor]="tag.accentColor + '20'"
              [style.color]="tag.accentColor"
              [style.borderColor]="tag.accentColor + '40'"
            >
              <span class="material-symbols-outlined text-[16px]">{{ tag.iconName || 'code' }}</span>
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                <a [routerLink]="['/questions']" [queryParams]="{ tag: tag.slug }">
                  {{ tag.name }}
                </a>
              </h3>
              <span class="text-[10px] font-mono text-slate-400">{{ tag.category }}</span>
            </div>
          </div>

          <span *ngIf="tag.isTrending" class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center gap-0.5">
            <span class="material-symbols-outlined text-[12px]">local_fire_department</span>
            <span>Hot</span>
          </span>
        </div>

        <!-- Description -->
        <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
          {{ tag.description }}
        </p>
      </div>

      <!-- Footer Telemetry -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1e293b] text-xs font-mono">
        <span class="text-slate-500 dark:text-slate-400">{{ tag.questionCount }} questions</span>
        <span class="text-emerald-500 flex items-center gap-0.5 font-semibold">
          <span class="material-symbols-outlined text-[14px]">trending_up</span>
          <span>+{{ tag.weeklyGrowthPercent }}%/wk</span>
        </span>
      </div>
    </div>
  `
})
export class TagCardComponent {
  @Input({ required: true }) tag!: TagSummary;
}

