import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-studio-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between p-2 border-b border-slate-200 dark:border-[#1e293b] bg-slate-100 dark:bg-[#161b22] text-slate-600 dark:text-slate-300 text-xs font-mono">
      <div class="flex items-center gap-1 overflow-x-auto">
        <button (click)="action.emit('h1')" type="button" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-[#21262d]" title="Heading 1">H1</button>
        <button (click)="action.emit('h2')" type="button" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-[#21262d]" title="Heading 2">H2</button>
        <button (click)="action.emit('bold')" type="button" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-[#21262d] font-bold" title="Bold">B</button>
        <button (click)="action.emit('italic')" type="button" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-[#21262d] italic" title="Italic">I</button>
        <span class="w-[1px] h-4 bg-slate-300 dark:bg-[#334155] mx-1"></span>
        <button (click)="action.emit('code')" type="button" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-[#21262d]" title="Code block">
          <span class="material-symbols-outlined text-[16px]">code</span>
        </button>
        <button (click)="action.emit('quote')" type="button" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-[#21262d]" title="Quote">
          <span class="material-symbols-outlined text-[16px]">format_quote</span>
        </button>
        <button (click)="action.emit('list')" type="button" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-[#21262d]" title="Bullet List">
          <span class="material-symbols-outlined text-[16px]">format_list_bulleted</span>
        </button>
        <button (click)="action.emit('table')" type="button" class="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-[#21262d]" title="Table">
          <span class="material-symbols-outlined text-[16px]">table</span>
        </button>
      </div>

      <div class="flex items-center gap-3 text-[11px] text-slate-400">
        <span>{{ wordCount }} words</span>
        <span>•</span>
        <span>{{ readingTime }} min read</span>
      </div>
    </div>
  `
})
export class StudioToolbarComponent {
  @Input() wordCount = 0;
  @Input() readingTime = 1;
  @Output() action = new EventEmitter<string>();
}

@Component({
  selector: 'app-article-metadata-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-80 border-l border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#111827] p-5 text-xs font-mono space-y-4">
      <h3 class="text-sm font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="material-symbols-outlined text-cyan-500 text-[18px]">tune</span>
        <span>Metadata & Distribution</span>
      </h3>

      <div>
        <label class="block text-slate-400 mb-1">Article Subtitle / Excerpt</label>
        <textarea
          [(ngModel)]="subtitle"
          (ngModelChange)="change.emit({ subtitle, canonicalUrl, tags, coverImageUrl })"
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
          (ngModelChange)="onTagsChange()"
          placeholder="Distributed Systems, Rust, Tokio"
          class="w-full p-2 rounded border border-slate-300 dark:border-[#1e293b] bg-white dark:bg-[#0d1117] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div>
        <label class="block text-slate-400 mb-1">Cover Image URL</label>
        <input
          type="text"
          [(ngModel)]="coverImageUrl"
          (ngModelChange)="change.emit({ subtitle, canonicalUrl, tags, coverImageUrl })"
          placeholder="https://..."
          class="w-full p-2 rounded border border-slate-300 dark:border-[#1e293b] bg-white dark:bg-[#0d1117] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div>
        <label class="block text-slate-400 mb-1">Canonical URL</label>
        <input
          type="text"
          [(ngModel)]="canonicalUrl"
          (ngModelChange)="change.emit({ subtitle, canonicalUrl, tags, coverImageUrl })"
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
  `
})
export class ArticleMetadataDrawerComponent {
  @Input() subtitle = '';
  @Input() canonicalUrl = '';
  @Input() coverImageUrl = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80';
  @Input() tags: string[] = ['Rust', 'Architecture'];

  tagsString = 'Rust, Architecture, Systems';
  @Output() change = new EventEmitter<any>();

  onTagsChange(): void {
    this.tags = this.tagsString.split(',').map(s => s.trim()).filter(Boolean);
    this.change.emit({ subtitle: this.subtitle, canonicalUrl: this.canonicalUrl, tags: this.tags, coverImageUrl: this.coverImageUrl });
  }
}

