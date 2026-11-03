import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal.component';

@Component({
  selector: 'app-ask-question-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      title="Ask a Technical Question"
      icon="help"
      maxWidth="720px"
      (onClose)="close()"
    >
      <form (ngSubmit)="submit()" class="space-y-4 text-xs font-mono">
        <div>
          <label class="block mb-1 text-slate-700 dark:text-slate-300 font-semibold">Title</label>
          <input
            type="text"
            [(ngModel)]="title"
            name="title"
            required
            placeholder="e.g. Rust tokio deadlock with mutex guard across .await points"
            class="w-full px-3 py-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label class="block mb-1 text-slate-700 dark:text-slate-300 font-semibold">Description (Markdown)</label>
          <textarea
            [(ngModel)]="contentMarkdown"
            name="contentMarkdown"
            required
            rows="5"
            placeholder="Describe the architectural problem, what you tried, and expected behavior..."
            class="w-full px-3 py-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
          ></textarea>
        </div>

        <div>
          <label class="block mb-1 text-slate-700 dark:text-slate-300 font-semibold">Reproducible Code Snippet</label>
          <textarea
            [(ngModel)]="codeSnippet"
            name="codeSnippet"
            rows="4"
            placeholder="// Paste minimal reproducible snippet here..."
            class="w-full px-3 py-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1 text-slate-700 dark:text-slate-300 font-semibold">Language</label>
            <select
              [(ngModel)]="language"
              name="language"
              class="w-full px-3 py-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="rust">Rust</option>
              <option value="postgresql">PostgreSQL / SQL</option>
              <option value="typescript">TypeScript</option>
              <option value="csharp">C# (.NET)</option>
              <option value="go">Go</option>
              <option value="yaml">YAML / Kubernetes</option>
            </select>
          </div>

          <div>
            <label class="block mb-1 text-slate-700 dark:text-slate-300 font-semibold">Tags (comma-separated)</label>
            <input
              type="text"
              [(ngModel)]="tagsString"
              name="tagsString"
              placeholder="rust, tokio, async"
              class="w-full px-3 py-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#1e293b]">
          <button
            type="button"
            (click)="close()"
            class="px-4 py-2 rounded border border-slate-300 dark:border-[#334155] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#182234]"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="!title || !contentMarkdown"
            class="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold font-sans shadow"
          >
            Post Question
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class AskQuestionModalComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<any>();

  title = '';
  contentMarkdown = '';
  codeSnippet = '';
  language = 'rust';
  tagsString = 'rust, tokio';

  close(): void {
    this.onClose.emit();
  }

  submit(): void {
    if (!this.title || !this.contentMarkdown) return;
    this.onSubmit.emit({
      title: this.title,
      contentMarkdown: this.contentMarkdown,
      codeSnippet: this.codeSnippet,
      language: this.language,
      tags: this.tagsString.split(',').map(s => s.trim()).filter(Boolean)
    });
    this.title = '';
    this.contentMarkdown = '';
    this.codeSnippet = '';
    this.close();
  }
}

