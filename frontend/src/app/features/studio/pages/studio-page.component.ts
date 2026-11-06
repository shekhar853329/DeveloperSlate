import { Component, inject, signal, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { StudioToolbarComponent } from '../components/studio-components';
import { EditorComponent, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';

@Component({
  selector: 'app-studio-page',
  standalone: true,
  imports: [CommonModule, FormsModule, StudioToolbarComponent, EditorComponent],
  // Load the self-hosted (offline, GPL) TinyMCE build from local assets instead of TinyMCE Cloud.
  providers: [{ provide: TINYMCE_SCRIPT_SRC, useValue: '/tinymce/tinymce.min.js' }],
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
            (click)="openPublishModal()"
            [disabled]="!title || !contentHtml"
            class="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 shadow transition-all"
          >
            <span class="material-symbols-outlined text-[16px]">publish</span>
            <span>Publish Article</span>
          </button>
        </div>
      </div>

      <!-- Studio Toolbar (word count / reading time) -->
      <app-studio-toolbar
        [wordCount]="wordCount"
        [readingTime]="readingTime"
      ></app-studio-toolbar>

      <!-- Editor -->
      <div class="flex-1 flex overflow-hidden" style="min-height:0">
        <div class="flex-1 flex flex-col bg-slate-50/50 dark:bg-[#0b0f17]" style="min-height:0">
          <div class="px-4 py-1.5 bg-slate-100 dark:bg-[#161b22] border-b border-slate-200 dark:border-[#1e293b] text-[11px] font-mono text-slate-400 flex justify-between">
            <span>RICH TEXT EDITOR</span>
            <span>TINYMCE • SELF-HOSTED</span>
          </div>
          <div class="editor-host flex-1" style="min-height:0">
            @if (ready()) {
              <editor
                [(ngModel)]="contentHtml"
                [init]="editorInit"
                licenseKey="gpl"
              ></editor>
            } @else {
              <div class="h-full flex items-center justify-center text-xs font-mono text-slate-400">
                Loading editor…
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- Metadata & Distribution modal (opened by the Publish Article button) -->
    @if (showPublishModal) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
        (click)="cancelPublish()"
      >
        <div
          class="w-full max-w-lg max-h-[85vh] flex flex-col rounded-lg border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal header -->
          <div class="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-[#1e293b]">
            <h3 class="text-sm font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-cyan-500 text-[18px]">tune</span>
              <span>Metadata &amp; Distribution</span>
            </h3>
            <button
              type="button"
              (click)="cancelPublish()"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Close"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <!-- Modal body -->
          <div class="p-5 space-y-4 text-xs font-mono overflow-y-auto">
            <div>
              <label class="block text-slate-400 mb-1">Article Subtitle / Excerpt</label>
              <textarea
                [(ngModel)]="subtitle"
                rows="3"
                placeholder="Brief 1-2 sentence hook..."
                class="w-full p-2 rounded border border-slate-300 dark:border-[#1e293b] bg-white dark:bg-[#0d1117] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
              ></textarea>
            </div>

            <div>
              <label class="block text-slate-400 mb-1">Tags (Comma-separated)</label>
              <input
                type="text"
                [(ngModel)]="tagsString"
                placeholder="Distributed Systems, Rust, Tokio"
                class="w-full p-2 rounded border border-slate-300 dark:border-[#1e293b] bg-white dark:bg-[#0d1117] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label class="block text-slate-400 mb-1">Cover Image URL</label>
              <input
                type="text"
                [(ngModel)]="coverImageUrl"
                placeholder="https://..."
                class="w-full p-2 rounded border border-slate-300 dark:border-[#1e293b] bg-white dark:bg-[#0d1117] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label class="block text-slate-400 mb-1">Canonical URL</label>
              <input
                type="text"
                [(ngModel)]="canonicalUrl"
                placeholder="https://engineering.org/blog/..."
                class="w-full p-2 rounded border border-slate-300 dark:border-[#1e293b] bg-white dark:bg-[#0d1117] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div class="pt-4 border-t border-slate-200 dark:border-[#1e293b] space-y-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked class="rounded border-slate-400 text-cyan-500" />
                <span>Publish to Engineering Feed</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked class="rounded border-slate-400 text-cyan-500" />
                <span>Notify Channel Subscribers</span>
              </label>
            </div>
          </div>

          <!-- Modal footer -->
          <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-[#1e293b]">
            <button
              type="button"
              (click)="cancelPublish()"
              class="px-3 py-1.5 rounded border border-slate-200 dark:border-[#1e293b] text-xs font-mono text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182234] transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="publish()"
              [disabled]="!title || !contentHtml"
              class="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 shadow transition-all"
            >
              <span class="material-symbols-outlined text-[16px]">publish</span>
              <span>Publish Article</span>
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class StudioPageComponent {
  private apiService = inject(ApiService);
  private router = inject(Router);

  title = 'Architecting a Resilient Event Sourcing System';
  subtitle = 'Dissecting transactional outbox patterns, dual-writes, and zero data loss.';
  contentHtml = `<h1>1. System Architecture Overview</h1>
<p>When building distributed enterprise services, maintaining data consistency between local transactional databases and external event streams (Kafka, RabbitMQ) is notoriously prone to partial network partitions.</p>
<h2>The Two-Phase Commit Problem</h2>
<p>Traditional distributed transactions (XA 2PC) incur high lock latency and create single points of coordination failure.</p>
<pre><code>-- Transactional outbox append
INSERT INTO outbox_events (aggregate_id, event_type, payload)
VALUES ($1, $2, $3);</code></pre>
<h3>Key Guarantees</h3>
<ul>
<li><strong>At-least-once delivery:</strong> Reliable outbox consumer relay.</li>
<li><strong>Idempotency keys:</strong> Consumers deduplicate UUIDs using Redis bloom filters.</li>
<li><strong>Microsecond replay capability:</strong> Rebuild state projections instantly from WAL logs.</li>
</ul>`;

  canonicalUrl = '';
  coverImageUrl = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80';
  tagsString = 'Event Sourcing, PostgreSQL, Kafka, Architecture';

  // Metadata & Distribution is hidden by default and only opened as a modal
  // when the author clicks "Publish Article".
  showPublishModal = false;

  // TinyMCE is a browser-only library (it touches `document`), so we only
  // mount the editor after the first client render. This keeps SSR/hydration
  // safe: the server and the first client render both show the loading state,
  // then the editor mounts without a hydration mismatch.
  ready = signal(false);

  constructor() {
    afterNextRender(() => this.ready.set(true));
  }

  editorInit: EditorComponent['init'] = {
    base_url: '/tinymce',
    suffix: '.min',
    height: '100%',
    resize: false,
    branding: false,
    promotion: false,
    // Full menubar so every open-source feature is reachable from the menus.
    menubar: 'file edit view insert format table tools help',
    // Every community (open-source, self-hosted) plugin that ships in the
    // `tinymce` npm package. `autoresize` is intentionally omitted: it makes the
    // editor grow with its content, which conflicts with this screen's fixed
    // full-height editor pane. Premium-only plugins (powerpaste, ai, spell
    // checker, comments, etc.) are not part of the self-hosted package.
    plugins: [
      'accordion', 'advlist', 'anchor', 'autolink', 'autosave', 'charmap',
      'code', 'codesample', 'directionality', 'emoticons', 'fullscreen',
      'help', 'image', 'importcss', 'insertdatetime', 'link', 'lists',
      'media', 'nonbreaking', 'pagebreak', 'preview', 'quickbars', 'save',
      'searchreplace', 'table', 'visualblocks', 'visualchars', 'wordcount'
    ].join(' '),
    toolbar: [
      'undo redo | save restoredraft | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | fullscreen',
      'bullist numlist outdent indent | blockquote | link image media codesample | table | charmap emoticons insertdatetime hr pagebreak nonbreaking anchor | ltr rtl | searchreplace removeformat | preview code visualblocks visualchars | help'
    ],
    // Keep each toolbar row on a single line (horizontal scroll) instead of
    // wrapping into a tall multi-row stack, so the editor pane stays compact.
    toolbar_mode: 'scrolling',
    image_advtab: true,
    image_caption: true,
    // Manual "Save" persists a local draft (open-source, no backend needed).
    save_onsavecallback: () => this.saveDraft(),
    content_style: 'body { font-family: "Inter", sans-serif; font-size: 13px; line-height: 1.55; }'
  };

  get wordCount(): number {
    const text = this.toPlainText(this.contentHtml);
    return text ? text.split(/\s+/).filter(Boolean).length : 0;
  }

  get readingTime(): number {
    return Math.max(1, Math.round(this.wordCount / 180));
  }

  openPublishModal(): void {
    this.showPublishModal = true;
  }

  cancelPublish(): void {
    this.showPublishModal = false;
  }

  publish(): void {
    this.apiService.publishBlog({
      title: this.title,
      subtitle: this.subtitle,
      excerpt: this.buildExcerpt(),
      // The backend stores article body in the `ContentMarkdown` column. With the
      // TinyMCE WYSIWYG editor the body is now HTML; we keep the existing field name
      // so no schema migration is required.
      contentMarkdown: this.contentHtml,
      tags: this.tagsString.split(',').map(s => s.trim()).filter(Boolean),
      coverImageUrl: this.coverImageUrl,
      canonicalUrl: this.canonicalUrl
    }).subscribe(blog => {
      this.showPublishModal = false;
      this.router.navigate(['/blogs', blog.slug]);
    });
  }

  /** Strips HTML to plain text for word counts and the article excerpt. */
  private toPlainText(html: string): string {
    if (typeof document !== 'undefined') {
      const el = document.createElement('div');
      el.innerHTML = html ?? '';
      return (el.textContent || '').replace(/\s+/g, ' ').trim();
    }
    return (html ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private buildExcerpt(): string {
    const text = this.toPlainText(this.contentHtml);
    return text.length > 160 ? text.slice(0, 160).trim() + '…' : text;
  }

  /** Persists the current article as a local draft (used by the Save button). */
  private saveDraft(): void {
    try {
      localStorage.setItem(
        'developerSlate:studio-draft',
        JSON.stringify({
          title: this.title,
          subtitle: this.subtitle,
          contentHtml: this.contentHtml,
          tags: this.tagsString.split(',').map(s => s.trim()).filter(Boolean),
          coverImageUrl: this.coverImageUrl,
          canonicalUrl: this.canonicalUrl,
          savedAt: new Date().toISOString()
        })
      );
    } catch {
      /* localStorage unavailable or quota exceeded — ignore */
    }
  }
}
