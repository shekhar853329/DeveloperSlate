import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-demo-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mt-6 pt-5 border-t border-slate-200 dark:border-[#1e293b]">
      <div class="flex items-center justify-between mb-3 text-[11px] font-mono text-slate-400">
        <span class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[14px] text-cyan-400">key</span>
          <span>QUICK 1-CLICK DEV LOGINS</span>
        </span>
        <span class="text-[10px] text-emerald-400">Verified Credentials</span>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs font-mono">
        <button
          type="button"
          (click)="selectAccount('alexchen', 'Password123!')"
          class="p-2.5 rounded border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#182234] hover:border-cyan-500/50 hover:bg-slate-100 dark:hover:bg-[#1e2638] text-left transition-all group"
        >
          <div class="flex items-center gap-2 mb-1">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              class="w-5 h-5 rounded-full object-cover"
            />
            <span class="font-bold text-slate-800 dark:text-white group-hover:text-cyan-400">Alex Chen</span>
          </div>
          <span class="text-[10px] text-slate-400 block truncate">Principal Systems Eng</span>
          <span class="text-[9px] text-cyan-500">alexchen (4,850 rep)</span>
        </button>

        <button
          type="button"
          (click)="selectAccount('amaravance', 'Password123!')"
          class="p-2.5 rounded border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#182234] hover:border-cyan-500/50 hover:bg-slate-100 dark:hover:bg-[#1e2638] text-left transition-all group"
        >
          <div class="flex items-center gap-2 mb-1">
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
              class="w-5 h-5 rounded-full object-cover"
            />
            <span class="font-bold text-slate-800 dark:text-white group-hover:text-cyan-400">Amara Vance</span>
          </div>
          <span class="text-[10px] text-slate-400 block truncate">Staff Concurrency Eng</span>
          <span class="text-[9px] text-purple-400">amaravance (3,920 rep)</span>
        </button>
      </div>
    </div>
  `
})
export class QuickDemoLoginComponent {
  @Output() onSelect = new EventEmitter<{ username: string; pass: string }>();

  selectAccount(username: string, pass: string): void {
    this.onSelect.emit({ username, pass });
  }
}

