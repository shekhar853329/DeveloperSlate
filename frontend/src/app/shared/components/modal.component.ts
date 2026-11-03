import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        (click)="$event.stopPropagation()"
        class="w-full rounded-lg border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        [style.maxWidth]="maxWidth"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#1e293b]">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-[#dfe2ee] flex items-center gap-2">
            <span *ngIf="icon" class="material-symbols-outlined text-cyan-500">{{ icon }}</span>
            <span>{{ title }}</span>
          </h3>
          <button
            (click)="close()"
            class="w-8 h-8 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1e2638] transition-colors"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 overflow-y-auto flex-1">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() icon = '';
  @Input() maxWidth = '640px';
  @Output() onClose = new EventEmitter<void>();

  close(): void {
    this.isOpen = false;
    this.onClose.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close();
    }
  }
}

