import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogPostItem } from '../../../core/models/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-featured-rfcs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="rfcs && rfcs.length > 0" class="mb-8">
      <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-[#1e293b]">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-indigo-500 text-[20px]">menu_book</span>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">
            Featured RFCs & Architectural Whitepapers
          </h3>
        </div>
        <a
          routerLink="/blogs"
          class="text-xs font-mono text-cyan-500 hover:text-cyan-400 flex items-center gap-1"
        >
          <span>All Publications</span>
          <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          *ngFor="let rfc of rfcs"
          class="rounded-xl border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] p-5 shadow-sm hover:border-indigo-500/40 transition-colors flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between gap-2 mb-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                PROPOSAL RFC
              </span>
              <span>{{ rfc.readingTimeMinutes }} min read</span>
            </div>

            <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug hover:text-cyan-500 transition-colors cursor-pointer">
              <a [routerLink]="['/blogs', rfc.slug]">
                {{ rfc.title }}
              </a>
            </h4>

            <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
              {{ rfc.excerpt }}
            </p>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1e293b] text-xs font-mono">
            <div class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span class="material-symbols-outlined text-[15px] text-rose-500">favorite</span>
              <span>{{ rfc.clapsCount }} claps</span>
            </div>
            <a
              [routerLink]="['/blogs', rfc.slug]"
              class="text-cyan-500 hover:text-cyan-400 font-medium flex items-center gap-1"
            >
              <span>Read Whitepaper</span>
              <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FeaturedRfcsComponent {
  @Input() rfcs: BlogPostItem[] = [];
}

