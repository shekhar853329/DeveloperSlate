import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      aria-live="assertive"
      aria-atomic="false"
      class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-sm px-4 py-3 rounded-lg border shadow-lg text-sm font-mono animate-slide-in"
          [class]="toastClasses(toast)"
          role="alert"
        >
          <!-- Icon -->
          <span class="material-symbols-outlined text-[18px] mt-px shrink-0">
            {{ iconFor(toast) }}
          </span>

          <!-- Message -->
          <span class="flex-1 leading-snug">{{ toast.message }}</span>

          <!-- Dismiss button -->
          <button
            type="button"
            (click)="toastService.dismiss(toast.id)"
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss notification"
          >
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { opacity: 0; transform: translateY(8px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)   scale(1); }
    }
    .animate-slide-in {
      animation: slide-in 0.18s ease-out forwards;
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  toastClasses(toast: Toast): string {
    const base = 'bg-white dark:bg-[#111827] text-slate-900 dark:text-white ';
    switch (toast.type) {
      case 'error':   return base + 'border-rose-500/50 dark:border-rose-500/40';
      case 'success': return base + 'border-emerald-500/50 dark:border-emerald-500/40';
      case 'warning': return base + 'border-amber-500/50 dark:border-amber-500/40';
      case 'info':    return base + 'border-cyan-500/50 dark:border-cyan-500/40';
    }
  }

  iconFor(toast: Toast): string {
    switch (toast.type) {
      case 'error':   return 'error';
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'info':    return 'info';
    }
  }
}
