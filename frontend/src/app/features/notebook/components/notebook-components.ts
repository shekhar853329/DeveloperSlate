import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SavedSnippetItem } from '../../../core/models/models';
import { CodeSnippetComponent } from '../../../shared/components/code-snippet.component';
import { ModalComponent } from '../../../shared/components/modal.component';

@Component({
  selector: 'app-snippet-card',
  standalone: true,
  imports: [CommonModule, CodeSnippetComponent],
  template: `
    <div
      class="rounded border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] p-5 mb-4 hover:border-slate-300 dark:hover:border-[#334155] transition-all"
      [class.border-l-4]="snippet.isPinned"
      [class.border-l-cyan-500]="snippet.isPinned"
    >
      <div class="flex items-start justify-between gap-4 mb-2">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-[#182234] text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-[#1e293b]">
              {{ snippet.category }}
            </span>
            <span *ngIf="snippet.isPinned" class="flex items-center gap-1 text-[11px] font-mono text-cyan-400">
              <span class="material-symbols-outlined text-[14px]">push_pin</span>
              <span>Pinned</span>
            </span>
          </div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white leading-snug">
            {{ snippet.title }}
          </h3>
        </div>

        <button
          (click)="onDelete.emit(snippet.id)"
          type="button"
          class="text-slate-400 hover:text-rose-500 p-1 transition-colors"
          title="Delete from Vault"
        >
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>

      <!-- Notes / Annotation -->
      <p *ngIf="snippet.notes" class="text-xs text-slate-600 dark:text-slate-400 font-mono mb-3 bg-slate-50 dark:bg-[#0d1117] p-2.5 rounded border border-slate-200 dark:border-[#1e293b]">
        {{ snippet.notes }}
      </p>

      <!-- Code Snippet -->
      <app-code-snippet
        [code]="snippet.codeContent"
        [language]="snippet.language"
      ></app-code-snippet>

      <!-- Footer Tags -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#1e293b] text-xs font-mono">
        <div class="flex items-center gap-1.5">
          <span *ngFor="let t of snippet.tags" class="text-[10px] px-1.5 py-0.2 rounded border border-slate-200 dark:border-[#1e293b] text-slate-400">
            #{{ t }}
          </span>
        </div>
        <span class="text-[11px] text-slate-400">Saved {{ snippet.createdAt | date:'mediumDate' }}</span>
      </div>
    </div>
  `
})
export class SnippetCardComponent {
  @Input({ required: true }) snippet!: SavedSnippetItem;
  @Output() onDelete = new EventEmitter<string>();
}

@Component({
  selector: 'app-add-snippet-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      title="Save Solution to Vault"
      icon="folder_special"
      maxWidth="680px"
      (onClose)="close()"
    >
      <form (ngSubmit)="submit()" class="space-y-4 text-xs font-mono">
        <div>
          <label class="block mb-1 text-slate-400">Solution Title</label>
          <input
            type="text"
            [(ngModel)]="title"
            name="title"
            required
            placeholder="e.g. Tokio Mutex drop before await point"
            class="w-full p-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1 text-slate-400">Category</label>
            <input
              type="text"
              [(ngModel)]="category"
              name="category"
              placeholder="Concurrency"
              class="w-full p-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label class="block mb-1 text-slate-400">Language</label>
            <input
              type="text"
              [(ngModel)]="language"
              name="language"
              placeholder="rust"
              class="w-full p-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div>
          <label class="block mb-1 text-slate-400">Executable Code</label>
          <textarea
            [(ngModel)]="codeContent"
            name="codeContent"
            required
            rows="6"
            placeholder="// Paste snippet..."
            class="w-full p-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
          ></textarea>
        </div>

        <div>
          <label class="block mb-1 text-slate-400">Personal Notes / Why it worked</label>
          <textarea
            [(ngModel)]="notes"
            name="notes"
            rows="2"
            placeholder="Notes on performance, benchmarks, or caveats..."
            class="w-full p-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
          ></textarea>
        </div>

        <div class="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-[#1e293b]">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" [(ngModel)]="isPinned" name="isPinned" class="rounded text-cyan-500" />
            <span>Pin this snippet to top</span>
          </label>

          <div class="flex items-center gap-3">
            <button type="button" (click)="close()" class="px-3 py-1.5 rounded border border-slate-300 dark:border-[#1e293b] text-slate-400">
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="!title || !codeContent"
              class="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold"
            >
              Save Snippet
            </button>
          </div>
        </div>
      </form>
    </app-modal>
  `
})
export class AddSnippetModalComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();

  title = '';
  category = 'Concurrency';
  language = 'rust';
  codeContent = '';
  notes = '';
  isPinned = false;

  close(): void {
    this.onClose.emit();
  }

  submit(): void {
    if (!this.title || !this.codeContent) return;
    this.onSave.emit({
      title: this.title,
      category: this.category,
      language: this.language,
      codeContent: this.codeContent,
      notes: this.notes,
      isPinned: this.isPinned,
      tags: [this.category.toLowerCase(), this.language.toLowerCase()]
    });
    this.title = '';
    this.codeContent = '';
    this.notes = '';
    this.close();
  }
}

