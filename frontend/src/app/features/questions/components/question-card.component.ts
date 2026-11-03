import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QuestionItem } from '../../../core/models/models';
import { VoteUnitComponent } from '../../../shared/components/vote-unit.component';
import { TagBadgeComponent, SolvedBadgeComponent, UserAvatarComponent } from '../../../shared/components/common-badges.component';

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [CommonModule, RouterModule, VoteUnitComponent, TagBadgeComponent, SolvedBadgeComponent, UserAvatarComponent],
  template: `
    <article
      class="group rounded border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] hover:border-slate-300 dark:hover:border-[#334155] p-4 transition-all duration-150 mb-3"
      [class.border-l-4]="question.isSolved"
      [class.border-l-emerald-500]="question.isSolved"
    >
      <div class="flex items-start gap-4">
        <!-- Vote Column -->
        <app-vote-unit
          [score]="question.score"
          (onVote)="handleVote($event)"
        ></app-vote-unit>

        <!-- Main Content -->
        <div class="flex-1 min-w-0">
          <!-- Title & Badges -->
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <h3 class="text-base font-semibold leading-snug group-hover:text-cyan-500 transition-colors">
              <a [routerLink]="['/questions', question.id]" class="hover:underline">
                {{ question.title }}
              </a>
            </h3>
            <app-solved-badge *ngIf="question.isSolved"></app-solved-badge>
          </div>

          <!-- Markdown Content Excerpt -->
          <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {{ question.contentMarkdown }}
          </p>

          <!-- Footer: Tags & Author Telemetry -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-[#1e293b]/60">
            <!-- Tags -->
            <div class="flex flex-wrap items-center gap-1.5">
              <app-tag-badge
                *ngFor="let t of question.tags"
                [name]="t.name"
                [slug]="t.slug"
                [accentColor]="t.accentColor"
              ></app-tag-badge>
            </div>

            <!-- Stats & Author -->
            <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">chat_bubble</span>
                <span>{{ question.answerCount }} answers</span>
              </span>

              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">visibility</span>
                <span>{{ question.viewCount }}</span>
              </span>

              <div class="flex items-center gap-1.5">
                <app-user-avatar
                  [avatarUrl]="question.author.avatarUrl"
                  [displayName]="question.author.displayName"
                  [size]="20"
                ></app-user-avatar>
                <a [routerLink]="['/profile', question.author.username]" class="hover:underline text-slate-700 dark:text-slate-300">
                  {{ question.author.displayName }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  `
})
export class QuestionCardComponent {
  @Input({ required: true }) question!: QuestionItem;
  @Output() onVote = new EventEmitter<{ id: string; delta: number }>();

  handleVote(delta: number): void {
    this.onVote.emit({ id: this.question.id, delta });
  }
}

