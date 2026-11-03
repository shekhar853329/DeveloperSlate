import { Injectable, signal } from '@angular/core';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  error(message: string, durationMs = 5000): void {
    this.add(message, 'error', durationMs);
  }

  success(message: string, durationMs = 3000): void {
    this.add(message, 'success', durationMs);
  }

  warning(message: string, durationMs = 4000): void {
    this.add(message, 'warning', durationMs);
  }

  info(message: string, durationMs = 3000): void {
    this.add(message, 'info', durationMs);
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  private add(message: string, type: ToastType, durationMs: number): void {
    const id = ++this.counter;
    this.toasts.update(list => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }
}
