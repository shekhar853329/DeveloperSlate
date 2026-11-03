import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { CodeDiffItem } from '../../../core/models/models';
import { DiffHeaderComponent, DiffPaneComponent } from '../components/diff-components';

@Component({
  selector: 'app-diff-page',
  standalone: true,
  imports: [CommonModule, DiffHeaderComponent, DiffPaneComponent],
  template: `
    <div class="max-w-6xl mx-auto">
      <!-- Title -->
      <div class="mb-6 pb-4 border-b border-slate-200 dark:border-[#1e293b]">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <span class="material-symbols-outlined text-cyan-500">difference</span>
          <span>Code Snippet & Full-Screen Diff Viewer</span>
        </h1>
        <p class="text-xs font-mono text-slate-500 mt-1">
          Inspect side-by-side AST patches, mutex lock fixes, and performance refactorings.
        </p>
      </div>

      <!-- Diff Container -->
      <div *ngIf="currentDiff" class="rounded-lg border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] overflow-hidden shadow-sm">
        <app-diff-header
          [filePath]="currentDiff.filePath"
          [commitHash]="currentDiff.commitHash"
          [additions]="currentDiff.additions"
          [deletions]="currentDiff.deletions"
          [viewMode]="viewMode"
          (modeChange)="viewMode = $event"
          (onCopy)="copyPatch()"
        ></app-diff-header>

        <app-diff-pane
          [originalCode]="currentDiff.originalCode"
          [modifiedCode]="currentDiff.modifiedCode"
          [viewMode]="viewMode"
        ></app-diff-pane>
      </div>
    </div>
  `
})
export class DiffPageComponent implements OnInit {
  private apiService = inject(ApiService);

  currentDiff: CodeDiffItem | null = null;
  viewMode: 'split' | 'unified' = 'split';

  ngOnInit(): void {
    this.apiService.getDiffs().subscribe(list => {
      if (list.length > 0) {
        this.currentDiff = list[0];
      }
    });
  }

  copyPatch(): void {
    if (!this.currentDiff) return;
    const patch = `--- a/${this.currentDiff.filePath}\n+++ b/${this.currentDiff.filePath}\n${this.currentDiff.modifiedCode}`;
    navigator.clipboard.writeText(patch);
  }
}

