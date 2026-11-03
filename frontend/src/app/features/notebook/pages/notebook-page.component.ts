import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { SavedSnippetItem } from '../../../core/models/models';
import { SnippetCardComponent, AddSnippetModalComponent } from '../components/notebook-components';

@Component({
  selector: 'app-notebook-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SnippetCardComponent, AddSnippetModalComponent],
  template: `
    <div class="max-w-5xl mx-auto">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-[#1e293b]">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span class="material-symbols-outlined text-cyan-500">folder_special</span>
            <span>Saved Solutions & Code Notebook</span>
            <span class="text-xs font-mono font-normal text-slate-400">v2.4 Vault</span>
          </h1>
          <p class="text-xs font-mono text-slate-500 mt-1">
            Personal repository of verified algorithms, concurrency patterns, and query optimizations.
          </p>
        </div>

        <button
          (click)="isModalOpen = true"
          type="button"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-sm"
        >
          <span class="material-symbols-outlined text-[16px]">add</span>
          <span>Save New Snippet</span>
        </button>
      </div>

      <!-- Categories & Search Bar -->
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
            (ngModelChange)="filterSnippets()"
            placeholder="Search saved snippets..."
            class="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <!-- Snippet Stream -->
      <div *ngIf="filteredSnippets.length > 0; else emptyState">
        <app-snippet-card
          *ngFor="let s of filteredSnippets"
          [snippet]="s"
          (onDelete)="deleteSnippet($event)"
        ></app-snippet-card>
      </div>

      <ng-template #emptyState>
        <div class="p-12 text-center rounded border border-dashed border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#111827]">
          <span class="material-symbols-outlined text-4xl text-slate-400 mb-2">folder_open</span>
          <h3 class="text-base font-semibold text-slate-700 dark:text-slate-300">No snippets found in this vault section</h3>
          <p class="text-xs text-slate-500 mt-1">Save solutions with one click from any verified question or workbench.</p>
        </div>
      </ng-template>

      <!-- Add Modal -->
      <app-add-snippet-modal
        [isOpen]="isModalOpen"
        (onClose)="isModalOpen = false"
        (onSave)="saveSnippet($event)"
      ></app-add-snippet-modal>
    </div>
  `
})
export class NotebookPageComponent implements OnInit {
  private apiService = inject(ApiService);

  snippets: SavedSnippetItem[] = [];
  filteredSnippets: SavedSnippetItem[] = [];
  selectedCategory = 'All';
  searchQuery = '';
  isModalOpen = false;

  categories = ['All', 'Concurrency', 'Database', 'Networking'];

  ngOnInit(): void {
    this.apiService.getSavedSnippets().subscribe(list => {
      this.snippets = list;
      this.filterSnippets();
    });
  }

  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.filterSnippets();
  }

  filterSnippets(): void {
    let result = [...this.snippets];
    if (this.selectedCategory !== 'All') {
      result = result.filter(s => s.category.toLowerCase() === this.selectedCategory.toLowerCase());
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(s => s.title.toLowerCase().includes(q) || s.notes.toLowerCase().includes(q));
    }
    this.filteredSnippets = result;
  }

  saveSnippet(snippet: Partial<SavedSnippetItem>): void {
    this.apiService.saveSnippet(snippet).subscribe(created => {
      this.snippets.unshift(created);
      this.filterSnippets();
    });
  }

  deleteSnippet(id: string): void {
    this.apiService.deleteSnippet(id).subscribe(() => {
      this.snippets = this.snippets.filter(s => s.id !== id);
      this.filterSnippets();
    });
  }
}

