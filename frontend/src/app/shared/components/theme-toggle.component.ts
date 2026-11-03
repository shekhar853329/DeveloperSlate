import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="themeService.toggleTheme()"
      type="button"
      class="flex items-center justify-center w-9 h-9 rounded border border-[#1e293b] dark:border-[#334155] bg-white dark:bg-[#182234] text-[#475569] dark:text-[#dfe2ee] hover:text-cyan-500 dark:hover:text-cyan-400 hover:border-cyan-500/50 transition-all duration-150"
      title="Toggle Dark / Light Mode"
    >
      <span class="material-symbols-outlined text-[18px]">
        {{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}
      </span>
    </button>
  `
})
export class ThemeToggleComponent {
  public themeService = inject(ThemeService);
}

