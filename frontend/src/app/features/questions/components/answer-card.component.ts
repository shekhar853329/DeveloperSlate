import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnswerItem } from '../../../core/models/models';
import { VoteUnitComponent } from '../../../shared/components/vote-unit.component';
import { CodeSnippetComponent } from '../../../shared/components/code-snippet.component';
import { UserAvatarComponent, SolvedBadgeComponent } from '../../../shared/components/common-badges.component';

@Component({
  selector: 'app-answer-card',
  standalone: true,
  imports: [CommonModule, RouterModule, VoteUnitComponent, CodeSnippetComponent, UserAvatarComponent, SolvedBadgeComponent],
  template: `
    <article
      class="rounded border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] p-5 my-4 transition-all"
      [class.border-emerald-500]="answer.isAccepted"
      [class.shadow-emerald-500-10]="answer.isAccepted"
    >
      <!-- Accepted Solution Header Banner -->
      <div *ngIf="answer.isAccepted" class="flex items-center justify-between pb-3 mb-4 border-b border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
        <div class="flex items-center gap-2 font-mono text-xs font-semibold">
          <span class="material-symbols-outlined text-[18px]">verified</span>
          <span>Verified Solution by Community & Maintainers</span>
        </div>
        <app-solved-badge label="Accepted"></app-solved-badge>
      </div>

      <div class="flex items-start gap-4">
        <!-- Vote Unit -->
        <app-vote-unit [score]="answer.score" (onVote)="onVote.emit($event)"></app-vote-unit>

        <!-- Main Answer Body -->
        <div class="flex-1 min-w-0">
          <div class="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line mb-3">
            {{ answer.contentMarkdown }}
          </div>

          <!-- Code Snippet if present -->
          <app-code-snippet
            *ngIf="answer.codeSnippet"
            [code]="answer.codeSnippet"
            [language]="answer.language || 'rust'"
          ></app-code-snippet>

          <!-- Author Telemetry Footnote -->
          <div class="flex items-center justify-between pt-3 mt-4 border-t border-slate-100 dark:border-[#1e293b] text-xs font-mono text-slate-500">
            <span class="text-[11px] text-slate-400">Answered {{ answer.createdAt | date:'mediumDate' }}</span>
            <div class="flex items-center gap-2">
              <app-user-avatar
                [avatarUrl]="answer.author.avatarUrl"
                [displayName]="answer.author.displayName"
                [size]="24"
              ></app-user-avatar>
              <div class="flex flex-col">
                <a [routerLink]="['/profile', answer.author.username]" class="font-medium text-slate-800 dark:text-slate-200 hover:text-cyan-500">
                  {{ answer.author.displayName }}
                </a>
                <span class="text-[10px] text-slate-400">{{ answer.author.title || 'Contributor' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  `
})
export class AnswerCardComponent {
  @Input({ required: true }) answer!: AnswerItem;
  @Output() onVote = new EventEmitter<number>();
}

