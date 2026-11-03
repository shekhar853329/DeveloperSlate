import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vote-unit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center select-none py-1">
      <button
        (click)="vote(1)"
        type="button"
        [class.text-cyan-400]="userVote === 1"
        [class.text-slate-400]="userVote !== 1"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-[#182234] hover:text-cyan-400 transition-colors"
        title="Upvote"
      >
        <span class="material-symbols-outlined text-[20px]">keyboard_arrow_up</span>
      </button>

      <span
        class="font-mono text-sm font-semibold my-0.5 tracking-tight"
        [class.text-cyan-400]="userVote === 1"
        [class.text-rose-400]="userVote === -1"
        [class.text-slate-700]="userVote === 0 && !isDark"
        [class.text-slate-200]="userVote === 0 && isDark"
      >
        {{ score }}
      </span>

      <button
        (click)="vote(-1)"
        type="button"
        [class.text-rose-400]="userVote === -1"
        [class.text-slate-400]="userVote !== -1"
        class="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-[#182234] hover:text-rose-400 transition-colors"
        title="Downvote"
      >
        <span class="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
      </button>
    </div>
  `
})
export class VoteUnitComponent {
  @Input() score = 0;
  @Input() userVote = 0;
  @Input() isDark = true;
  @Output() onVote = new EventEmitter<number>();

  vote(val: number): void {
    if (this.userVote === val) {
      this.score -= val;
      this.userVote = 0;
      this.onVote.emit(0);
    } else {
      this.score += val - this.userVote;
      this.userVote = val;
      this.onVote.emit(val);
    }
  }
}

