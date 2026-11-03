import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AppTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  public currentTheme = signal<AppTheme>('dark');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('devslate-theme') as AppTheme;
      if (saved === 'dark' || saved === 'light') {
        this.currentTheme.set(saved);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.currentTheme.set(prefersDark ? 'dark' : 'light');
      }

      this.applyTheme(this.currentTheme());

      effect(() => {
        const theme = this.currentTheme();
        this.applyTheme(theme);
        localStorage.setItem('devslate-theme', theme);
      });
    }
  }

  public toggleTheme(): void {
    this.currentTheme.update(t => (t === 'dark' ? 'light' : 'dark'));
  }

  public isDark(): boolean {
    return this.currentTheme() === 'dark';
  }

  private applyTheme(theme: AppTheme): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }
}

