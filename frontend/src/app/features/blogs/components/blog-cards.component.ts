import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogPostItem } from '../../../core/models/models';
import { UserAvatarComponent } from '../../../shared/components/common-badges.component';

@Component({
  selector: 'app-featured-article-hero',
  standalone: true,
  imports: [CommonModule, RouterModule, UserAvatarComponent],
  template: `
    <article
      *ngIf="article"
      class="relative overflow-hidden rounded-lg border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] mb-8 group hover:border-cyan-500/50 transition-all duration-200"
    >
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-0">
        <!-- Cover Image with Gradient Vignette -->
        <div class="lg:col-span-5 relative h-64 lg:h-auto overflow-hidden bg-slate-900">
          <img
            [src]="article.coverImageUrl"
            [alt]="article.title"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div class="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent to-[#111827]/80"></div>
          <span class="absolute top-4 left-4 px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-cyan-500 text-slate-950 shadow">
            Featured Deep Dive
          </span>
        </div>

        <!-- Hero Content Pane -->
        <div class="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span *ngFor="let t of article.tags.slice(0, 3)" class="text-[11px] font-mono px-2 py-0.5 rounded border border-slate-200 dark:border-[#1e293b] bg-slate-100 dark:bg-[#182234] text-cyan-600 dark:text-cyan-400">
                #{{ t }}
              </span>
              <span class="text-xs text-slate-400 font-mono">• {{ article.readingTimeMinutes }} min read</span>
            </div>

            <h2 class="text-xl lg:text-2xl font-bold leading-tight text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors mb-3">
              <a [routerLink]="['/blogs', article.slug]">
                {{ article.title }}
              </a>
            </h2>

            <p class="text-xs lg:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {{ article.subtitle || article.excerpt }}
            </p>
          </div>

          <!-- Author Footnote -->
          <div class="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-[#1e293b] text-xs font-mono">
            <div class="flex items-center gap-2.5">
              <app-user-avatar
                [avatarUrl]="article.author.avatarUrl"
                [displayName]="article.author.displayName"
                [size]="32"
              ></app-user-avatar>
              <div>
                <span class="font-medium text-slate-900 dark:text-white block">{{ article.author.displayName }}</span>
                <span class="text-[10px] text-slate-400">{{ article.author.title || 'Architect' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-4 text-slate-400">
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px]">favorite</span>
                <span>{{ article.clapsCount }}</span>
              </span>
              <span class="flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px]">bookmark</span>
                <span>{{ article.bookmarkCount }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  `
})
export class FeaturedArticleHeroComponent {
  @Input({ required: true }) article!: BlogPostItem;
}

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [CommonModule, RouterModule, UserAvatarComponent],
  template: `
    <article
      class="group rounded border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] overflow-hidden flex flex-col hover:border-slate-300 dark:hover:border-[#334155] transition-all"
    >
      <div class="h-44 overflow-hidden relative bg-slate-800">
        <img
          [src]="article.coverImageUrl"
          [alt]="article.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div class="absolute bottom-2 left-2 flex gap-1">
          <span *ngFor="let t of article.tags.slice(0, 2)" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-cyan-300 border border-white/10">
            {{ t }}
          </span>
        </div>
      </div>

      <div class="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div class="flex items-center gap-2 text-[11px] font-mono text-slate-400 mb-2">
            <span>{{ article.publishedAt | date:'mediumDate' }}</span>
            <span>•</span>
            <span>{{ article.readingTimeMinutes }} min read</span>
          </div>

          <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors mb-2 line-clamp-2">
            <a [routerLink]="['/blogs', article.slug]">
              {{ article.title }}
            </a>
          </h3>

          <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
            {{ article.excerpt }}
          </p>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1e293b] text-xs font-mono text-slate-500">
          <div class="flex items-center gap-2">
            <app-user-avatar
              [avatarUrl]="article.author.avatarUrl"
              [displayName]="article.author.displayName"
              [size]="22"
            ></app-user-avatar>
            <span class="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{{ article.author.displayName }}</span>
          </div>

          <div class="flex items-center gap-3">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">favorite</span>
              <span>{{ article.clapsCount }}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  `
})
export class BlogCardComponent {
  @Input({ required: true }) article!: BlogPostItem;
}

