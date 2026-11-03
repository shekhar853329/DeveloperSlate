import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagSummary } from '../../../core/models/models';

@Component({
  selector: 'app-question-filters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-[#1e293b]">
      <!-- Sort Tabs -->
      <div class="flex items-center gap-1 p-1 rounded border border-slate-200 dark:border-[#1e293b] bg-slate-100 dark:bg-[#111827] text-xs font-mono">
        <button
          *ngFor="let tab of tabs"
          (click)="selectTab(tab.key)"
          type="button"
          class="px-3 py-1 rounded transition-colors"
          [class.bg-white]="selectedSort === tab.key"
          [class.dark:bg-[#182234]]="selectedSort === tab.key"
          [class.text-cyan-600]="selectedSort === tab.key"
          [class.dark:text-cyan-400]="selectedSort === tab.key"
          [class.font-semibold]="selectedSort === tab.key"
          [class.text-slate-600]="selectedSort !== tab.key"
          [class.dark:text-slate-400]="selectedSort !== tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tag Filter Quick Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
        <button
          (click)="selectTag('')"
          type="button"
          class="px-2 py-0.5 rounded border transition-colors"
          [class.border-cyan-500]="!selectedTag"
          [class.bg-cyan-500-10]="!selectedTag"
          [class.text-cyan-400]="!selectedTag"
          [class.border-slate-300]="selectedTag"
          [class.dark:border-[#1e293b]]="selectedTag"
          [class.text-slate-500]="selectedTag"
        >
          All
        </button>
        <button
          *ngFor="let t of popularTags"
          (click)="selectTag(t.slug)"
          type="button"
          class="px-2 py-0.5 rounded border transition-colors flex items-center gap-1"
          [class.border-cyan-500]="selectedTag === t.slug"
          [class.bg-cyan-500-10]="selectedTag === t.slug"
          [class.text-cyan-400]="selectedTag === t.slug"
          [class.border-slate-300]="selectedTag !== t.slug"
          [class.dark:border-[#1e293b]]="selectedTag !== t.slug"
          [class.text-slate-600]="selectedTag !== t.slug"
          [class.dark:text-slate-400]="selectedTag !== t.slug"
        >
          <span class="w-1.5 h-1.5 rounded-full" [style.backgroundColor]="t.accentColor"></span>
          <span>{{ t.name }}</span>
        </button>
      </div>
    </div>
  `
})
export class QuestionFiltersComponent {
  @Input() selectedSort = 'newest';
  @Input() selectedTag = '';
  @Input() popularTags: TagSummary[] = [];

  @Output() sortChange = new EventEmitter<string>();
  @Output() tagChange = new EventEmitter<string>();

  tabs = [
    { key: 'newest', label: 'Newest' },
    { key: 'votes', label: 'Most Voted' },
    { key: 'solved', label: 'Verified Solved' },
    { key: 'unanswered', label: 'Unanswered' }
  ];

  selectTab(key: string): void {
    this.selectedSort = key;
    this.sortChange.emit(key);
  }

  selectTag(slug: string): void {
    this.selectedTag = slug;
    this.tagChange.emit(slug);
  }
}

