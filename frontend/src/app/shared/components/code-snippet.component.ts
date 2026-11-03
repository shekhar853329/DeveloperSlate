import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code-snippet',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded border border-slate-200 dark:border-[#1e293b] bg-slate-100 dark:bg-[#0d1117] overflow-hidden my-3 text-xs font-mono">
      <!-- Toolbar Header -->
      <div class="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-[#1e293b] bg-slate-200/60 dark:bg-[#161b22] text-slate-600 dark:text-slate-400">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          <span *ngIf="filename" class="ml-2 font-medium text-slate-700 dark:text-slate-300">{{ filename }}</span>
          <span *ngIf="!filename && language" class="ml-1 uppercase text-[10px] tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold">{{ language }}</span>
        </div>
        <button
          (click)="copyCode()"
          type="button"
          class="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] hover:bg-slate-300 dark:hover:bg-[#21262d] text-slate-600 dark:text-slate-300 transition-colors"
          title="Copy Code"
        >
          <span class="material-symbols-outlined text-[14px]">{{ copied ? 'check' : 'content_copy' }}</span>
          <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
        </button>
      </div>

      <!-- Code Body with Line Numbers -->
      <div class="p-3 overflow-x-auto text-slate-800 dark:text-[#dfe2ee] leading-5">
        <table class="w-full border-collapse">
          <tbody>
            <tr *ngFor="let line of lines; let i = index" class="hover:bg-slate-200/50 dark:hover:bg-[#161b22]/50">
              <td *ngIf="showLineNumbers" class="select-none pr-3 text-right text-slate-400 dark:text-slate-600 w-8 align-top text-[11px]">
                {{ i + 1 }}
              </td>
              <td class="whitespace-pre align-top"><code>{{ line }}</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class CodeSnippetComponent {
  @Input() code = '';
  @Input() language = 'rust';
  @Input() filename?: string;
  @Input() showLineNumbers = true;

  copied = false;

  get lines(): string[] {
    return this.code ? this.code.split('\n') : [];
  }

  copyCode(): void {
    if (!this.code) return;
    navigator.clipboard.writeText(this.code).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}

