import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileDetail } from '../../../core/models/models';

@Component({
  selector: 'app-profile-activity-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="profile" class="flex items-center gap-2 overflow-x-auto border-b border-slate-200 dark:border-[#1e293b] pb-px mb-6 font-mono text-xs">
      <button
        (click)="tabChange.emit('solutions')"
        class="flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium whitespace-nowrap transition-colors"
        [class.border-cyan-500]="activeTab === 'solutions'"
        [class.text-cyan-500]="activeTab === 'solutions'"
        [class.border-transparent]="activeTab !== 'solutions'"
        [class.text-slate-500]="activeTab !== 'solutions'"
        [class.hover:text-slate-700]="activeTab !== 'solutions'"
        [class.dark:text-slate-400]="activeTab !== 'solutions'"
        [class.dark:hover:text-slate-200]="activeTab !== 'solutions'"
      >
        <span class="material-symbols-outlined text-[16px]">verified</span>
        <span>Verified Solutions</span>
        <span class="px-1.5 py-0.2 rounded text-[10px] bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 font-bold">
          {{ profile.solvedCount }}
        </span>
      </button>

      <button
        (click)="tabChange.emit('articles')"
        class="flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium whitespace-nowrap transition-colors"
        [class.border-cyan-500]="activeTab === 'articles'"
        [class.text-cyan-500]="activeTab === 'articles'"
        [class.border-transparent]="activeTab !== 'articles'"
        [class.text-slate-500]="activeTab !== 'articles'"
        [class.hover:text-slate-700]="activeTab !== 'articles'"
        [class.dark:text-slate-400]="activeTab !== 'articles'"
        [class.dark:hover:text-slate-200]="activeTab !== 'articles'"
      >
        <span class="material-symbols-outlined text-[16px]">article</span>
        <span>Published Articles</span>
        <span class="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 dark:bg-[#1e293b] text-slate-700 dark:text-slate-300">
          {{ profile.articlesCount }}
        </span>
      </button>

      <button
        (click)="tabChange.emit('questions')"
        class="flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium whitespace-nowrap transition-colors"
        [class.border-cyan-500]="activeTab === 'questions'"
        [class.text-cyan-500]="activeTab === 'questions'"
        [class.border-transparent]="activeTab !== 'questions'"
        [class.text-slate-500]="activeTab !== 'questions'"
        [class.hover:text-slate-700]="activeTab !== 'questions'"
        [class.dark:text-slate-400]="activeTab !== 'questions'"
        [class.dark:hover:text-slate-200]="activeTab !== 'questions'"
      >
        <span class="material-symbols-outlined text-[16px]">help</span>
        <span>Questions</span>
        <span class="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 dark:bg-[#1e293b] text-slate-700 dark:text-slate-300">
          {{ profile.questionCount }}
        </span>
      </button>

      <button
        (click)="tabChange.emit('rfcs')"
        class="flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium whitespace-nowrap transition-colors"
        [class.border-cyan-500]="activeTab === 'rfcs'"
        [class.text-cyan-500]="activeTab === 'rfcs'"
        [class.border-transparent]="activeTab !== 'rfcs'"
        [class.text-slate-500]="activeTab !== 'rfcs'"
        [class.hover:text-slate-700]="activeTab !== 'rfcs'"
        [class.dark:text-slate-400]="activeTab !== 'rfcs'"
        [class.dark:hover:text-slate-200]="activeTab !== 'rfcs'"
      >
        <span class="material-symbols-outlined text-[16px]">description</span>
        <span>Peer RFCs</span>
        <span class="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold">
          {{ profile.peerRfcCount }}
        </span>
      </button>

      <button
        (click)="tabChange.emit('gists')"
        class="flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium whitespace-nowrap transition-colors"
        [class.border-cyan-500]="activeTab === 'gists'"
        [class.text-cyan-500]="activeTab === 'gists'"
        [class.border-transparent]="activeTab !== 'gists'"
        [class.text-slate-500]="activeTab !== 'gists'"
        [class.hover:text-slate-700]="activeTab !== 'gists'"
        [class.dark:text-slate-400]="activeTab !== 'gists'"
        [class.dark:hover:text-slate-200]="activeTab !== 'gists'"
      >
        <span class="material-symbols-outlined text-[16px]">data_object</span>
        <span>Gists & Benchmarks</span>
        <span class="px-1.5 py-0.2 rounded text-[10px] bg-slate-200 dark:bg-[#1e293b] text-slate-700 dark:text-slate-300">
          {{ profile.gistsCount }}
        </span>
      </button>
    </div>
  `
})
export class ProfileActivityTabsComponent {
  @Input({ required: true }) profile!: ProfileDetail;
  @Input() activeTab: string = 'solutions';
  @Output() tabChange = new EventEmitter<string>();
}

