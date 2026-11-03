import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contribution-matrix',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] p-6 mb-6 shadow-sm">
      <!-- Header with Tabs and Peak Hours -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-[#1e293b]">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="material-symbols-outlined text-cyan-500 text-[19px]">calendar_month</span>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">
              Annual Contribution Matrix
            </h3>
            <span class="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-[#1e293b] text-slate-700 dark:text-slate-300">
              {{ totalEvents | number }} Events
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span class="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
              <span class="material-symbols-outlined text-[13px]">bolt</span>
              <span>Peak Window: <strong>{{ peakHours }}</strong></span>
            </span>
          </div>
        </div>

        <!-- Filter Sub-Tabs -->
        <div class="flex items-center gap-1 bg-slate-100 dark:bg-[#0d1117] p-1 rounded-lg border border-slate-200 dark:border-[#1e293b]">
          <button
            *ngFor="let tab of activityTabs"
            (click)="selectedTab.set(tab.key)"
            class="px-2.5 py-1 rounded text-xs font-mono transition-colors"
            [class.bg-white]="selectedTab() === tab.key && !isDark"
            [class.bg-[#1e293b]]="selectedTab() === tab.key && isDark"
            [class.text-cyan-500]="selectedTab() === tab.key"
            [class.text-slate-500]="selectedTab() !== tab.key"
            [class.dark:text-slate-400]="selectedTab() !== tab.key"
            [class.shadow-sm]="selectedTab() === tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Streak Highlights -->
      <div class="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 mb-3 px-1">
        <span>Continuous commit & telemetry ingestion</span>
        <div class="flex items-center gap-4">
          <span>Current Streak: <strong class="text-emerald-500 dark:text-emerald-400">14 days</strong></span>
          <span>Longest: <strong class="text-cyan-500 dark:text-cyan-400">38 days</strong></span>
        </div>
      </div>

      <!-- Heatmap Grid -->
      <div class="overflow-x-auto pb-2">
        <div class="flex gap-1 min-w-[760px]">
          <div *ngFor="let col of matrixColumns" class="flex flex-col gap-1">
            <div
              *ngFor="let day of col"
              class="w-3.5 h-3.5 rounded-[3px] transition-transform hover:scale-125 cursor-pointer"
              [class.bg-slate-200]="day.level === 0 && !isDark"
              [class.bg-[#161f30]]="day.level === 0 && isDark"
              [class.bg-cyan-900]="day.level === 1"
              [class.bg-cyan-700]="day.level === 2"
              [class.bg-cyan-500]="day.level === 3"
              [class.bg-cyan-300]="day.level === 4"
              [title]="day.date + ': ' + day.count + ' contributions'"
            ></div>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="flex flex-col sm:flex-row items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-[#1e293b] text-[11px] font-mono text-slate-500 dark:text-slate-400 gap-2">
        <span class="flex items-center gap-1.5 text-[10px]">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>PostgreSQL & Git telemetry synced in real-time</span>
        </span>
        <div class="flex items-center gap-1.5">
          <span>Less</span>
          <span class="w-3 h-3 rounded-[2px]" [class.bg-slate-200]="!isDark" [class.bg-[#161f30]]="isDark"></span>
          <span class="w-3 h-3 rounded-[2px] bg-cyan-900"></span>
          <span class="w-3 h-3 rounded-[2px] bg-cyan-700"></span>
          <span class="w-3 h-3 rounded-[2px] bg-cyan-500"></span>
          <span class="w-3 h-3 rounded-[2px] bg-cyan-300"></span>
          <span>More</span>
        </div>
      </div>
    </div>
  `
})
export class ContributionMatrixComponent {
  @Input() days: any[] = [];
  @Input() totalEvents: number = 1420;
  @Input() peakHours: string = '21:00 - 03:00 UTC';
  @Input() isDark = true;

  selectedTab = signal<string>('all');

  activityTabs = [
    { key: 'all', label: 'All Activity' },
    { key: 'solutions', label: 'Solutions' },
    { key: 'snippets', label: 'Snippets' },
    { key: 'articles', label: 'Articles' }
  ];

  get matrixColumns(): any[][] {
    const cols: any[][] = [];
    const totalDays = this.days.length || 364;
    for (let i = 0; i < totalDays; i += 7) {
      cols.push(this.days.slice(i, i + 7));
    }
    return cols;
  }
}

