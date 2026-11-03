import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-answer-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rounded border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] p-5 my-6">
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-[#1e293b]">
        <h3 class="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
          <span class="material-symbols-outlined text-cyan-500 text-[18px]">edit_note</span>
          <span>Your Technical Solution</span>
        </h3>
        <div class="flex items-center gap-2 text-xs font-mono">
          <button
            type="button"
            (click)="isPreview = false"
            [class.text-cyan-500]="!isPreview"
            [class.font-bold]="!isPreview"
            class="px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#182234]"
          >
            Write
          </button>
          <button
            type="button"
            (click)="isPreview = true"
            [class.text-cyan-500]="isPreview"
            [class.font-bold]="isPreview"
            class="px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-[#182234]"
          >
            Preview
          </button>
        </div>
      </div>

      <!-- Editor Mode -->
      <div *ngIf="!isPreview" class="space-y-3">
        <textarea
          [(ngModel)]="content"
          rows="6"
          placeholder="Write your in-depth verified answer using Markdown... Include architectural considerations and benchmark results."
          class="w-full p-3 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500 leading-relaxed"
        ></textarea>

        <div>
          <label class="block mb-1 text-xs font-mono text-slate-500">Optional Code Snippet</label>
          <textarea
            [(ngModel)]="codeSnippet"
            rows="4"
            placeholder="// Paste executable or fixed code snippet..."
            class="w-full p-3 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
          ></textarea>
        </div>
      </div>

      <!-- Preview Mode -->
      <div *ngIf="isPreview" class="p-4 rounded border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] min-h-[160px] text-xs leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
        {{ content || 'Nothing to preview yet.' }}
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-end gap-3 pt-3 mt-4 border-t border-slate-200 dark:border-[#1e293b]">
        <button
          type="button"
          (click)="submit()"
          [disabled]="!content.trim()"
          class="px-5 py-2 rounded text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 transition-all shadow"
        >
          Post Solution
        </button>
      </div>
    </div>
  `
})
export class AnswerEditorComponent {
  @Output() onSubmit = new EventEmitter<{ content: string; codeSnippet?: string }>();

  content = '';
  codeSnippet = '';
  isPreview = false;

  submit(): void {
    if (!this.content.trim()) return;
    this.onSubmit.emit({
      content: this.content,
      codeSnippet: this.codeSnippet || undefined
    });
    this.content = '';
    this.codeSnippet = '';
    this.isPreview = false;
  }
}

