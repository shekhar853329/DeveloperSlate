import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { BlogPostItem } from '../../../core/models/models';
import { FeaturedArticleHeroComponent, BlogCardComponent } from '../components/blog-cards.component';

@Component({
  selector: 'app-blogs-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FeaturedArticleHeroComponent, BlogCardComponent],
  template: `
    <div class="max-w-6xl mx-auto">
      <!-- Page Title -->
      <div class="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-[#1e293b]">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span class="material-symbols-outlined text-cyan-500">auto_stories</span>
            <span>KernelFlow Engineering Publications</span>
          </h1>
          <p class="text-xs font-mono text-slate-500 mt-1">
            Deep-dive technical architectural articles, post-mortems, and kernel benchmarks.
          </p>
        </div>

        <a
          routerLink="/studio"
          class="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-mono font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-sm"
        >
          <span class="material-symbols-outlined text-[16px]">edit_square</span>
          <span>Write Article</span>
        </a>
      </div>

      <!-- Featured Article Hero -->
      <app-featured-article-hero
        *ngIf="featuredArticle()"
        [article]="featuredArticle()!"
      ></app-featured-article-hero>

      <!-- Section Title -->
      <h3 class="text-sm font-mono uppercase tracking-wider text-slate-500 font-semibold mb-4">
        Latest Technical Deep Dives
      </h3>

      <!-- Grid of Regular Articles -->
      <div *ngIf="regularArticles().length > 0; else noRegular" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <app-blog-card
          *ngFor="let b of regularArticles()"
          [article]="b"
        ></app-blog-card>
      </div>

      <ng-template #noRegular>
        <div *ngIf="!featuredArticle()" class="p-12 text-center rounded border border-dashed border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#111827]">
          <span class="material-symbols-outlined text-4xl text-slate-400 mb-2">article</span>
          <h3 class="text-base font-semibold text-slate-700 dark:text-slate-300">No articles published yet</h3>
          <p class="text-xs text-slate-500 mt-1">Write your first technical deep-dive in the Publishing Studio.</p>
        </div>
      </ng-template>
    </div>
  `
})
export class BlogsPageComponent implements OnInit {
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  blogs = signal<BlogPostItem[]>([]);

  featuredArticle = computed<BlogPostItem | undefined>(() => {
    const list = this.blogs();
    return list.find(b => b.isFeatured) || list[0];
  });

  regularArticles = computed<BlogPostItem[]>(() => {
    const list = this.blogs();
    const feat = this.featuredArticle();
    return list.filter(b => b.id !== feat?.id);
  });

  ngOnInit(): void {
    this.apiService.getBlogs().subscribe(list => {
      this.blogs.set(list);
      this.cdr.markForCheck();
    });
  }
}

@Component({
  selector: 'app-blog-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <article *ngIf="article()" class="max-w-3xl mx-auto">
      <nav class="flex items-center gap-2 mb-6 text-xs font-mono text-slate-500">
        <a routerLink="/blogs" class="hover:text-cyan-500 flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">arrow_back</span>
          <span>Publications</span>
        </a>
        <span>/</span>
        <span class="text-slate-400 truncate max-w-sm">{{ article()!.title }}</span>
      </nav>

      <div class="mb-6">
        <div class="flex items-center gap-2 text-xs font-mono text-cyan-500 mb-3">
          <span *ngFor="let t of article()!.tags" class="px-2 py-0.5 rounded border border-cyan-500/20 bg-cyan-500/10">
            #{{ t }}
          </span>
          <span class="text-slate-400">• {{ article()!.readingTimeMinutes }} min read</span>
        </div>

        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
          {{ article()!.title }}
        </h1>

        <p *ngIf="article()!.subtitle" class="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-sans">
          {{ article()!.subtitle }}
        </p>

        <!-- Author Bar -->
        <div class="flex items-center justify-between py-4 border-y border-slate-200 dark:border-[#1e293b]">
          <div class="flex items-center gap-3">
            <img [src]="article()!.author.avatarUrl" class="w-10 h-10 rounded-full border border-slate-300 dark:border-[#1e293b]" />
            <div>
              <span class="font-bold text-slate-900 dark:text-white text-sm block">{{ article()!.author.displayName }}</span>
              <span class="text-xs text-slate-500 font-mono">{{ article()!.author.title }} • {{ article()!.publishedAt | date:'mediumDate' }}</span>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button
              (click)="clap()"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 dark:border-[#1e293b] hover:border-cyan-500 text-xs font-mono"
            >
              <span class="material-symbols-outlined text-rose-500 text-[18px]">favorite</span>
              <span>{{ article()!.clapsCount }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Hero Banner Image -->
      <div class="rounded-lg overflow-hidden my-6 border border-slate-200 dark:border-[#1e293b]">
        <img [src]="article()!.coverImageUrl" class="w-full max-h-96 object-cover" />
      </div>

      <!-- Prose Content -->
      <div class="article-content max-w-none text-sm lg:text-base leading-relaxed text-slate-800 dark:text-slate-200 py-4" [innerHTML]="article()!.contentMarkdown"></div>
    </article>
  `
})
export class BlogDetailPageComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  article = signal<BlogPostItem | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe((p: any) => {
      const slug = p['slug'];
      if (slug) {
        this.apiService.getBlogBySlug(slug).subscribe(b => {
          this.article.set(b);
          this.cdr.markForCheck();
        });
      }
    });
  }

  clap(): void {
    const art = this.article();
    if (!art) return;
    this.article.update(a => a ? { ...a, clapsCount: a.clapsCount + 1 } : null);
    this.apiService.clapBlog(art.id).subscribe();
  }
}
