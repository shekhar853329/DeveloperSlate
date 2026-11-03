import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-diff-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#161b22] text-xs font-mono">
      <div class="flex items-center gap-3">
        <span class="material-symbols-outlined text-cyan-500 text-[20px]">difference</span>
        <div>
          <span class="font-bold text-slate-900 dark:text-white text-sm">{{ filePath }}</span>
          <div class="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>Commit: <code class="text-cyan-400">{{ commitHash }}</code></span>
            <span>•</span>
            <span class="text-emerald-500 font-semibold">+{{ additions }}</span>
            <span class="text-rose-500 font-semibold">-{{ deletions }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- View mode toggle -->
        <div class="flex items-center rounded border border-slate-300 dark:border-[#334155] p-0.5 bg-slate-200 dark:bg-[#0d1117]">
          <button
            type="button"
            (click)="modeChange.emit('split')"
            class="px-2.5 py-1 rounded text-[11px] transition-colors"
            [class.bg-white]="viewMode === 'split'"
            [class.dark:bg-[#182234]]="viewMode === 'split'"
            [class.text-cyan-500]="viewMode === 'split'"
            [class.font-bold]="viewMode === 'split'"
            [class.text-slate-400]="viewMode !== 'split'"
          >
            Split
          </button>
          <button
            type="button"
            (click)="modeChange.emit('unified')"
            class="px-2.5 py-1 rounded text-[11px] transition-colors"
            [class.bg-white]="viewMode === 'unified'"
            [class.dark:bg-[#182234]]="viewMode === 'unified'"
            [class.text-cyan-500]="viewMode === 'unified'"
            [class.font-bold]="viewMode === 'unified'"
            [class.text-slate-400]="viewMode !== 'unified'"
          >
            Unified
          </button>
        </div>

        <button
          (click)="onCopy.emit()"
          type="button"
          class="flex items-center gap-1 px-3 py-1.5 rounded border border-slate-300 dark:border-[#334155] hover:border-cyan-500 text-slate-700 dark:text-slate-200 transition-colors"
        >
          <span class="material-symbols-outlined text-[14px]">content_copy</span>
          <span>Copy Patch</span>
        </button>
      </div>
    </div>
  `
})
export class DiffHeaderComponent {
  @Input() filePath = 'src/concurrency/worker_pool.rs';
  @Input() commitHash = '8f3b20e';
  @Input() additions = 14;
  @Input() deletions = 6;
  @Input() viewMode: 'split' | 'unified' = 'split';

  @Output() modeChange = new EventEmitter<'split' | 'unified'>();
  @Output() onCopy = new EventEmitter<void>();
}

@Component({
  selector: 'app-diff-pane',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Split View -->
    <div *ngIf="viewMode === 'split'" class="grid grid-cols-2 divide-x divide-slate-200 dark:divide-[#1e293b] font-mono text-xs overflow-x-auto">
      <!-- Left: Original (Deletions) -->
      <div class="bg-rose-500/5 dark:bg-rose-950/20 p-4 leading-6 text-slate-800 dark:text-rose-200">
        <div class="text-[10px] uppercase font-bold text-rose-500 mb-2 select-none">Original (with Deadlock)</div>
        <table class="w-full border-collapse">
          <tbody>
            <tr *ngFor="let l of originalLines; let i = index" class="hover:bg-rose-500/10">
              <td class="w-8 select-none text-slate-400 text-right pr-3 text-[11px]">{{ i + 1 }}</td>
              <td class="select-none text-rose-500 pr-2 w-4">-</td>
              <td class="whitespace-pre"><code>{{ l }}</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Right: Modified (Additions) -->
      <div class="bg-emerald-500/5 dark:bg-emerald-950/20 p-4 leading-6 text-slate-800 dark:text-emerald-200">
        <div class="text-[10px] uppercase font-bold text-emerald-500 mb-2 select-none">Fixed (Scoped Drop)</div>
        <table class="w-full border-collapse">
          <tbody>
            <tr *ngFor="let l of modifiedLines; let i = index" class="hover:bg-emerald-500/10">
              <td class="w-8 select-none text-slate-400 text-right pr-3 text-[11px]">{{ i + 1 }}</td>
              <td class="select-none text-emerald-500 pr-2 w-4">+</td>
              <td class="whitespace-pre"><code>{{ l }}</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Unified View -->
    <div *ngIf="viewMode === 'unified'" class="p-4 font-mono text-xs leading-6 overflow-x-auto bg-slate-50 dark:bg-[#0d1117]">
      <table class="w-full border-collapse">
        <tbody>
          <tr *ngFor="let l of originalLines; let i = index" class="bg-rose-500/10 text-rose-600 dark:text-rose-300">
            <td class="w-8 select-none text-slate-400 text-right pr-3 text-[11px]">{{ i + 1 }}</td>
            <td class="select-none text-rose-500 pr-2 w-4">-</td>
            <td class="whitespace-pre"><code>{{ l }}</code></td>
          </tr>
          <tr *ngFor="let l of modifiedLines; let i = index" class="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
            <td class="w-8 select-none text-slate-400 text-right pr-3 text-[11px]">{{ i + 1 }}</td>
            <td class="select-none text-emerald-500 pr-2 w-4">+</td>
            <td class="whitespace-pre"><code>{{ l }}</code></td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class DiffPaneComponent {
  @Input() originalCode = '';
  @Input() modifiedCode = '';
  @Input() viewMode: 'split' | 'unified' = 'split';

  get originalLines(): string[] {
    return this.originalCode ? this.originalCode.split('\n') : [];
  }

  get modifiedLines(): string[] {
    return this.modifiedCode ? this.modifiedCode.split('\n') : [];
  }
}

