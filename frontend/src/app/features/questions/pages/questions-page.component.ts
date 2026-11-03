import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { QuestionItem, TagSummary } from '../../../core/models/models';
import { QuestionCardComponent } from '../components/question-card.component';
import { QuestionFiltersComponent } from '../components/question-filters.component';
import { AskQuestionModalComponent } from '../components/ask-question-modal.component';

@Component({
  selector: 'app-questions-page',
  standalone: true,
  imports: [CommonModule, QuestionCardComponent, QuestionFiltersComponent, AskQuestionModalComponent],
  template: `
    <div class="max-w-5xl mx-auto">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <span class="material-symbols-outlined text-cyan-500">terminal</span>
            <span>Problem Explorer</span>
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            High-concurrency systems, low-latency runtimes, and verified database solutions.
          </p>
        </div>

        <button
          (click)="isModalOpen = true"
          type="button"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-mono font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-sm"
        >
          <span class="material-symbols-outlined text-[16px]">add</span>
          <span>Ask Question</span>
        </button>
      </div>

      <!-- Filters & Sorting -->
      <app-question-filters
        [selectedSort]="currentSort"
        [selectedTag]="currentTag"
        [popularTags]="popularTags"
        (sortChange)="onSortChange($event)"
        (tagChange)="onTagChange($event)"
      ></app-question-filters>

      <!-- Question List -->
      <div *ngIf="questions.length > 0; else emptyState">
        <app-question-card
          *ngFor="let q of questions"
          [question]="q"
          (onVote)="handleVote($event)"
        ></app-question-card>
      </div>

      <!-- Empty State -->
      <ng-template #emptyState>
        <div class="p-12 text-center rounded border border-dashed border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#111827]">
          <span class="material-symbols-outlined text-4xl text-slate-400 mb-2">search_off</span>
          <h3 class="text-base font-semibold text-slate-700 dark:text-slate-300">No questions found</h3>
          <p class="text-xs text-slate-500 mt-1">Try resetting the tag or search filter.</p>
        </div>
      </ng-template>

      <!-- Ask Question Modal -->
      <app-ask-question-modal
        [isOpen]="isModalOpen"
        (onClose)="isModalOpen = false"
        (onSubmit)="createQuestion($event)"
      ></app-ask-question-modal>
    </div>
  `
})
export class QuestionsPageComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);

  questions: QuestionItem[] = [];
  popularTags: TagSummary[] = [];
  currentSort = 'newest';
  currentTag = '';
  searchQuery = '';
  isModalOpen = false;

  ngOnInit(): void {
    this.loadTags();

    this.route.queryParams.subscribe(params => {
      this.currentTag = params['tag'] || '';
      this.searchQuery = params['search'] || '';
      this.loadQuestions();
    });
  }

  loadTags(): void {
    this.apiService.getTags().subscribe(tags => {
      this.popularTags = tags.slice(0, 6);
    });
  }

  loadQuestions(): void {
    this.apiService.getQuestions(this.currentTag, this.currentSort, this.searchQuery).subscribe(qs => {
      this.questions = qs;
    });
  }

  onSortChange(sort: string): void {
    this.currentSort = sort;
    this.loadQuestions();
  }

  onTagChange(tag: string): void {
    this.currentTag = tag;
    this.loadQuestions();
  }

  handleVote(event: { id: string; delta: number }): void {
    this.apiService.voteQuestion(event.id, event.delta).subscribe();
  }

  createQuestion(data: any): void {
    this.apiService.createQuestion(data).subscribe(newQ => {
      this.questions.unshift(newQ);
    });
  }
}

