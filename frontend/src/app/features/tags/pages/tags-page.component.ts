import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { TagSummary } from '../../../core/models/models';
import { TagCardComponent } from '../components/tag-components';

@Component({
  selector: 'app-tags-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TagCardComponent],
  template: `
    <div class="max-w-6xl mx-auto">
      <!-- Page Header -->
      <div class="mb-6 pb-4 border-b border-slate-200 dark:border-[#1e293b]">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <span class="material-symbols-outlined text-cyan-500">tag</span>
          <span>Technology Stacks & Tag Ecosystem</span>
        </h1>
        <p class="text-xs font-mono text-slate-500 mt-1">
          A tag is a keyword or label that categorizes your problem with other, similar questions.
        </p>
      </div>

      <!-- Category Filter Pills & Search -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div class="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <button
            *ngFor="let cat of categories"
            (click)="selectCategory(cat)"
            type="button"
            class="px-3 py-1 rounded border transition-colors"
            [class.border-cyan-500]="selectedCategory === cat"
            [class.bg-cyan-500-10]="selectedCategory === cat"
            [class.text-cyan-400]="selectedCategory === cat"
            [class.font-bold]="selectedCategory === cat"
            [class.border-slate-300]="selectedCategory !== cat"
            [class.dark:border-[#1e293b]]="selectedCategory !== cat"
            [class.text-slate-500]="selectedCategory !== cat"
          >
            {{ cat }}
          </button>
        </div>

        <div class="w-full sm:w-64 relative">
          <span class="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[16px]">search</span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="filterTags()"
            placeholder="Filter tags..."
            class="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <!-- Tag Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-tag-card
          *ngFor="let t of filteredTags"
          [tag]="t"
        ></app-tag-card>
      </div>
    </div>
  `
})
export class TagsPageComponent implements OnInit {
  private apiService = inject(ApiService);

  tags: TagSummary[] = [];
  filteredTags: TagSummary[] = [];
  selectedCategory = 'All';
  searchQuery = '';

  categories = ['All', 'Language', 'Framework', 'Database', 'Cloud & Infra', 'Systems'];

  ngOnInit(): void {
    this.apiService.getTags().subscribe(data => {
      this.tags = data;
      this.filterTags();
    });
  }

  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.filterTags();
  }

  filterTags(): void {
    let result = [...this.tags];
    if (this.selectedCategory !== 'All') {
      result = result.filter(t => t.category?.toLowerCase() === this.selectedCategory.toLowerCase());
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(t => t.name.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q)));
    }
    this.filteredTags = result;
  }
}

