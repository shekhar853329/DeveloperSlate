import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { StudioToolbarComponent, ArticleMetadataDrawerComponent } from '../components/studio-components';

@Component({
  selector: 'app-studio-page',
  standalone: true,
  imports: [CommonModule, FormsModule, StudioToolbarComponent, ArticleMetadataDrawerComponent],
  template: `
    <div class="h-[calc(100vh-6rem)] flex flex-col rounded-lg border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] overflow-hidden">
      <!-- Studio Top Navigation -->
      <div class="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117]">
        <div class="flex items-center gap-3 flex-1 max-w-xl">
          <span class="material-symbols-outlined text-cyan-500 text-[22px]">terminal</span>
          <input
            type="text"
            [(ngModel)]="title"
            placeholder="Article Title: e.g. Architecting a Resilient Event Sourcing System..."
            class="w-full text-base font-bold bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="toggleDrawer()"
            class="flex items-center gap-1 px-3 py-1.5 rounded border border-slate-200 dark:border-[#1e293b] text-xs font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182234]"
          >
            <span class="material-symbols-outlined text-[16px]">tune</span>
            <span>Settings</span>
          </button>

          <button
            type="button"
            (click)="publish()"
            [disabled]="!title || !contentMarkdown"
            class="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 shadow transition-all"
          >
            <span class="material-symbols-outlined text-[16px]">publish</span>
            <span>Publish Article</span>
          </button>
        </div>
      </div>

      <!-- Studio Toolbar -->
      <app-studio-toolbar
        [wordCount]="wordCount"
        [readingTime]="readingTime"
        (action)="applyFormat($event)"
      ></app-studio-toolbar>

      <!-- Main Editor & Preview Grid -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Markdown Raw Editor Pane -->
        <div class="flex-1 flex flex-col border-r border-slate-200 dark:border-[#1e293b] bg-slate-50/50 dark:bg-[#0b0f17]">
          <div class="px-4 py-1.5 bg-slate-100 dark:bg-[#161b22] border-b border-slate-200 dark:border-[#1e293b] text-[11px] font-mono text-slate-400 flex justify-between">
            <span>MARKDOWN EDITOR</span>
            <span>UTF-8</span>
          </div>
          <textarea
            #editorArea
            [(ngModel)]="contentMarkdown"
            placeholder="Start drafting your technical publication in Markdown..."
            class="flex-1 w-full p-6 bg-transparent border-none text-xs font-mono text-slate-800 dark:text-[#dfe2ee] leading-relaxed resize-none focus:outline-none"
          ></textarea>
        </div>

        <!-- Rendered Live Preview Pane -->
        <div class="flex-1 flex flex-col bg-white dark:bg-[#111827] overflow-y-auto">
          <div class="px-4 py-1.5 bg-slate-100 dark:bg-[#161b22] border-b border-slate-200 dark:border-[#1e293b] text-[11px] font-mono text-slate-400 flex justify-between">
            <span>LIVE PREVIEW</span>
            <span>PROSE RENDERED</span>
          </div>
          <div class="p-6 prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
            <h1 class="text-2xl font-bold mb-3">{{ title || 'Untitled Article' }}</h1>
            <p *ngIf="subtitle" class="text-slate-400 text-sm italic mb-4">{{ subtitle }}</p>
            {{ contentMarkdown || 'Live formatted preview will appear here as you write...' }}
          </div>
        </div>

        <!-- Metadata Right Drawer -->
        <app-article-metadata-drawer
          *ngIf="showDrawer"
          [subtitle]="subtitle"
          [canonicalUrl]="canonicalUrl"
          [coverImageUrl]="coverImageUrl"
          [tags]="tags"
          (change)="onMetadataChange($event)"
        ></app-article-metadata-drawer>
      </div>
    </div>
  `
})
export class StudioPageComponent {
  private apiService = inject(ApiService);
  private router = inject(Router);

  title = 'Architecting a Resilient Event Sourcing System';
  subtitle = 'Dissecting transactional outbox patterns, dual-writes, and zero data loss.';
  contentMarkdown = `## 1. System Architecture Overview

When building distributed enterprise services, maintaining data consistency between local transactional databases and external event streams (Kafka, RabbitMQ) is notoriously prone to partial network partitions.

### The Two-Phase Commit Problem
Traditional distributed transactions (XA 2PC) incur high lock latency and create single points of coordination failure.

\`\`\`rust
// Transactional outbox table append
async fn record_order(tx: &mut Transaction<'_, Postgres>, order: &Order) -> Result<(), Error> {
    sqlx::query!("INSERT INTO orders (id, total) VALUES ($1, $2)", order.id, order.total)
        .execute(&mut **tx).await?;
        
    sqlx::query!("INSERT INTO outbox_events (aggregate_id, event_type, payload) VALUES ($1, $2, $3)", 
        order.id, "OrderCreated", serde_json::to_value(order)?)
        .execute(&mut **tx).await?;
        
    Ok(())
}
\`\`\`

### Key Guarantees:
- **At-least-once delivery:** Reliable outbox consumer relay.
- **Idempotency keys:** Consumers deduct duplicate UUIDs using redis bloom filters.
- **Microsecond replay capability:** Rebuild state projections instantly from WAL logs.`;

  canonicalUrl = '';
  coverImageUrl = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80';
  tags: string[] = ['Event Sourcing', 'PostgreSQL', 'Kafka', 'Architecture'];
  showDrawer = true;

  get wordCount(): number {
    return this.contentMarkdown ? this.contentMarkdown.trim().split(/\s+/).length : 0;
  }

  get readingTime(): number {
    return Math.max(1, Math.round(this.wordCount / 180));
  }

  toggleDrawer(): void {
    this.showDrawer = !this.showDrawer;
  }

  applyFormat(type: string): void {
    switch (type) {
      case 'h1': this.contentMarkdown += '\n# Heading 1\n'; break;
      case 'h2': this.contentMarkdown += '\n## Heading 2\n'; break;
      case 'bold': this.contentMarkdown += ' **bold text** '; break;
      case 'italic': this.contentMarkdown += ' *italic text* '; break;
      case 'code': this.contentMarkdown += '\n```rust\n// code snippet\n```\n'; break;
      case 'quote': this.contentMarkdown += '\n> Blockquote\n'; break;
      case 'list': this.contentMarkdown += '\n- Item 1\n- Item 2\n'; break;
      case 'table': this.contentMarkdown += '\n| Header 1 | Header 2 |\n|---|---|\n| Cell 1 | Cell 2 |\n'; break;
    }
  }

  onMetadataChange(meta: any): void {
    this.subtitle = meta.subtitle;
    this.canonicalUrl = meta.canonicalUrl;
    this.coverImageUrl = meta.coverImageUrl;
    this.tags = meta.tags;
  }

  publish(): void {
    this.apiService.publishBlog({
      title: this.title,
      subtitle: this.subtitle,
      contentMarkdown: this.contentMarkdown,
      tags: this.tags,
      coverImageUrl: this.coverImageUrl,
      canonicalUrl: this.canonicalUrl
    }).subscribe(blog => {
      this.router.navigate(['/blogs', blog.slug]);
    });
  }
}

