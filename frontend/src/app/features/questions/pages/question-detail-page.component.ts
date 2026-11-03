import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { QuestionItem } from '../../../core/models/models';
import { VoteUnitComponent } from '../../../shared/components/vote-unit.component';
import { TagBadgeComponent, SolvedBadgeComponent, UserAvatarComponent } from '../../../shared/components/common-badges.component';
import { CodeSnippetComponent } from '../../../shared/components/code-snippet.component';
import { AnswerCardComponent } from '../components/answer-card.component';
import { AnswerEditorComponent } from '../components/answer-editor.component';

@Component({
  selector: 'app-question-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    VoteUnitComponent,
    TagBadgeComponent,
    SolvedBadgeComponent,
    UserAvatarComponent,
    CodeSnippetComponent,
    AnswerCardComponent,
    AnswerEditorComponent
  ],
  template: `
    <div *ngIf="question" class="max-w-4xl mx-auto">
      <!-- Back Navigation Breadcrumb -->
      <nav class="flex items-center gap-2 mb-4 text-xs font-mono text-slate-500">
        <a routerLink="/questions" class="hover:text-cyan-500 flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">arrow_back</span>
          <span>Questions</span>
        </a>
        <span>/</span>
        <span class="text-slate-400 truncate max-w-sm">{{ question.title }}</span>
      </nav>

      <!-- Question Main Container -->
      <div class="rounded border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] p-6 mb-6">
        <!-- Title & Status -->
        <div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#1e293b]">
          <h1 class="text-xl font-bold leading-tight text-slate-900 dark:text-white">
            {{ question.title }}
          </h1>
          <app-solved-badge *ngIf="question.isSolved"></app-solved-badge>
        </div>

        <!-- Telemetry Metadata Bar -->
        <div class="flex flex-wrap items-center gap-4 py-3 text-xs font-mono text-slate-500 border-b border-slate-100 dark:border-[#1e293b] mb-4">
          <span class="flex items-center gap-1">
            <span class="text-slate-400">Asked:</span>
            <span>{{ question.createdAt | date:'mediumDate' }}</span>
          </span>
          <span class="flex items-center gap-1">
            <span class="text-slate-400">Views:</span>
            <span>{{ question.viewCount }}</span>
          </span>
          <span class="flex items-center gap-1">
            <span class="text-slate-400">Solutions:</span>
            <span class="text-cyan-500 font-bold">{{ question.answers?.length || question.answerCount }}</span>
          </span>
        </div>

        <div class="flex items-start gap-5">
          <!-- Vote Column -->
          <app-vote-unit [score]="question.score" (onVote)="voteQuestion($event)"></app-vote-unit>

          <!-- Question Content & Code -->
          <div class="flex-1 min-w-0">
            <div class="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line mb-4">
              {{ question.contentMarkdown }}
            </div>

            <app-code-snippet
              *ngIf="question.codeSnippet"
              [code]="question.codeSnippet"
              [language]="question.language || 'rust'"
              filename="reproducible_example.rs"
            ></app-code-snippet>

            <!-- Tags -->
            <div class="flex flex-wrap items-center gap-2 my-4">
              <app-tag-badge
                *ngFor="let t of question.tags"
                [name]="t.name"
                [slug]="t.slug"
                [accentColor]="t.accentColor"
              ></app-tag-badge>
            </div>

            <!-- Author Signature Card -->
            <div class="flex justify-end pt-3 border-t border-slate-100 dark:border-[#1e293b]">
              <div class="flex items-center gap-2.5 px-3 py-1.5 rounded bg-slate-50 dark:bg-[#182234] border border-slate-200 dark:border-[#1e293b]">
                <app-user-avatar
                  [avatarUrl]="question.author.avatarUrl"
                  [displayName]="question.author.displayName"
                  [size]="28"
                ></app-user-avatar>
                <div class="flex flex-col text-xs font-mono">
                  <a [routerLink]="['/profile', question.author.username]" class="font-medium text-slate-900 dark:text-white hover:text-cyan-500">
                    {{ question.author.displayName }}
                  </a>
                  <span class="text-[10px] text-cyan-500">{{ question.author.reputation }} rep</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Solutions Heading -->
      <div class="flex items-center justify-between my-6">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>{{ question.answers?.length || 0 }} Answers</span>
          <span *ngIf="question.isSolved" class="text-xs font-mono font-normal text-emerald-500">(1 Verified)</span>
        </h2>
      </div>

      <!-- Answers Stream -->
      <div *ngIf="question.answers && question.answers.length > 0">
        <app-answer-card
          *ngFor="let ans of question.answers"
          [answer]="ans"
          (onVote)="voteAnswer(ans.id, $event)"
        ></app-answer-card>
      </div>

      <!-- Solution Composer -->
      <app-answer-editor (onSubmit)="postAnswer($event)"></app-answer-editor>
    </div>
  `
})
export class QuestionDetailPageComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);

  question: QuestionItem | null = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.apiService.getQuestionById(id).subscribe(q => {
          this.question = q;
        });
      }
    });
  }

  voteQuestion(delta: number): void {
    if (!this.question) return;
    this.apiService.voteQuestion(this.question.id, delta).subscribe();
  }

  voteAnswer(ansId: string, delta: number): void {
    // Vote logic
  }

  postAnswer(data: { content: string; codeSnippet?: string }): void {
    if (!this.question) return;
    this.apiService.postAnswer(this.question.id, {
      contentMarkdown: data.content,
      codeSnippet: data.codeSnippet,
      language: this.question.language || 'rust'
    }).subscribe(newAns => {
      if (!this.question!.answers) this.question!.answers = [];
      this.question!.answers.push(newAns);
      this.question!.answerCount += 1;
    });
  }
}

