import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-studio-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-end gap-3 p-2 border-b border-slate-200 dark:border-[#1e293b] bg-slate-100 dark:bg-[#161b22] text-[11px] font-mono text-slate-400">
      <span>{{ wordCount }} words</span>
      <span>•</span>
      <span>{{ readingTime }} min read</span>
    </div>
  `
})
export class StudioToolbarComponent {
  @Input() wordCount = 0;
  @Input() readingTime = 1;
}
