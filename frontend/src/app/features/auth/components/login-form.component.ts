import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Mode Toggle Switch (Sign In vs Register) -->
      <div class="flex items-center p-1 rounded border border-slate-200 dark:border-[#1e293b] bg-slate-100 dark:bg-[#0d1117] mb-6 text-xs font-mono">
        <button
          type="button"
          (click)="setMode(false)"
          class="flex-1 py-1.5 rounded transition-colors text-center font-semibold"
          [class.bg-white]="!isRegisterMode"
          [class.dark:bg-[#182234]]="!isRegisterMode"
          [class.text-cyan-500]="!isRegisterMode"
          [class.shadow-sm]="!isRegisterMode"
          [class.text-slate-400]="isRegisterMode"
        >
          Sign In
        </button>

        <button
          type="button"
          (click)="setMode(true)"
          class="flex-1 py-1.5 rounded transition-colors text-center font-semibold"
          [class.bg-white]="isRegisterMode"
          [class.dark:bg-[#182234]]="isRegisterMode"
          [class.text-cyan-500]="isRegisterMode"
          [class.shadow-sm]="isRegisterMode"
          [class.text-slate-400]="!isRegisterMode"
        >
          Register Terminal ID
        </button>
      </div>

      <!-- Error Alert -->
      <div
        *ngIf="errorMessage"
        class="mb-4 p-3 rounded border border-rose-500/40 bg-rose-500/10 text-rose-500 dark:text-rose-400 text-xs font-mono flex items-center gap-2 animate-shake"
      >
        <span class="material-symbols-outlined text-[18px]">error</span>
        <span>{{ errorMessage }}</span>
      </div>

      <!-- GitHub OAuth 1-Click Button -->
      <button
        type="button"
        (click)="githubAuth.emit()"
        class="w-full py-2.5 px-4 mb-4 rounded border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#182234] hover:bg-slate-50 dark:hover:bg-[#1e2638] hover:border-cyan-500/50 text-slate-800 dark:text-white text-xs font-mono font-semibold flex items-center justify-center gap-2.5 transition-all shadow-sm"
      >
        <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        <span>Continue with GitHub Developer ID</span>
      </button>

      <!-- Divider -->
      <div class="relative flex py-2 items-center mb-4">
        <div class="flex-grow border-t border-slate-200 dark:border-[#1e293b]"></div>
        <span class="flex-shrink mx-3 text-[10px] font-mono text-slate-400 uppercase tracking-widest">or terminal credentials</span>
        <div class="flex-grow border-t border-slate-200 dark:border-[#1e293b]"></div>
      </div>

      <!-- Main Form -->
      <form (ngSubmit)="submit()" class="space-y-4 text-xs font-mono">
        <!-- Register Extra Fields -->
        <div *ngIf="isRegisterMode" class="space-y-3">
          <div>
            <label class="block mb-1 text-slate-700 dark:text-slate-300 font-semibold">Display Name</label>
            <input
              type="text"
              [(ngModel)]="displayName"
              name="displayName"
              placeholder="e.g. Alex Chen"
              class="w-full px-3 py-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label class="block mb-1 text-slate-700 dark:text-slate-300 font-semibold">Specialization / Title</label>
            <input
              type="text"
              [(ngModel)]="title"
              name="title"
              placeholder="e.g. Systems Architect, Distributed Systems"
              class="w-full px-3 py-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <!-- Username or Email -->
        <div>
          <label class="block mb-1 text-slate-700 dark:text-slate-300 font-semibold">
            {{ isRegisterMode ? 'Username' : 'Username or Email' }}
          </label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[16px]">
              {{ isRegisterMode ? 'badge' : 'alternate_email' }}
            </span>
            <input
              type="text"
              [(ngModel)]="usernameOrEmail"
              name="usernameOrEmail"
              required
              [placeholder]="isRegisterMode ? 'developer_handle' : 'alexchen or alex.chen@kernel.io'"
              class="w-full pl-9 pr-3 py-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        <!-- Email for Registration -->
        <div *ngIf="isRegisterMode">
          <label class="block mb-1 text-slate-700 dark:text-slate-300 font-semibold">Work / Dev Email</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[16px]">mail</span>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="developer@kernel.io"
              class="w-full pl-9 pr-3 py-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        <!-- Password -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-slate-700 dark:text-slate-300 font-semibold">Password / SSH Keyphrase</label>
            <a *ngIf="!isRegisterMode" href="javascript:void(0)" class="text-[11px] text-cyan-500 hover:underline">
              Forgot key?
            </a>
          </div>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[16px]">lock</span>
            <input
              [type]="showPassword ? 'text' : 'password'"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="••••••••••••"
              class="w-full pl-9 pr-10 py-2 rounded border border-slate-300 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono tracking-widest"
            />
            <button
              type="button"
              (click)="showPassword = !showPassword"
              class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              title="Show / Hide Password"
            >
              <span class="material-symbols-outlined text-[16px]">
                {{ showPassword ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Remember Me Checkbox -->
        <div class="flex items-center justify-between pt-1">
          <label class="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 text-[11px]">
            <input
              type="checkbox"
              [(ngModel)]="rememberMe"
              name="rememberMe"
              class="rounded border-slate-400 text-cyan-500 focus:ring-0 focus:ring-offset-0"
            />
            <span>Remember terminal session (7 days)</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          [disabled]="isLoading || !usernameOrEmail || !password"
          class="w-full py-2.5 px-4 rounded text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 flex items-center justify-center gap-2 transition-all shadow mt-2"
        >
          <span *ngIf="!isLoading" class="material-symbols-outlined text-[16px]">login</span>
          <span *ngIf="isLoading" class="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
          <span>{{ isLoading ? 'Authenticating...' : isRegisterMode ? 'Complete Registration' : 'Authenticate Terminal' }}</span>
        </button>
      </form>
    </div>
  `
})
export class LoginFormCardComponent {
  @Input() isLoading = false;
  @Input() errorMessage = '';
  @Output() onSubmit = new EventEmitter<any>();
  @Output() githubAuth = new EventEmitter<void>();

  isRegisterMode = false;
  showPassword = false;
  usernameOrEmail = 'alexchen';
  password = 'Password123!';
  displayName = '';
  email = '';
  title = '';
  rememberMe = true;

  setMode(register: boolean): void {
    this.isRegisterMode = register;
    this.errorMessage = '';
  }

  fillCredentials(username: string, pass: string): void {
    this.usernameOrEmail = username;
    this.password = pass;
    this.isRegisterMode = false;
  }

  submit(): void {
    if (!this.usernameOrEmail || !this.password) return;

    if (this.isRegisterMode) {
      this.onSubmit.emit({
        isRegister: true,
        username: this.usernameOrEmail,
        displayName: this.displayName || this.usernameOrEmail,
        email: this.email || `${this.usernameOrEmail}@kernel.io`,
        password: this.password,
        title: this.title || 'Systems Engineer'
      });
    } else {
      this.onSubmit.emit({
        isRegister: false,
        usernameOrEmail: this.usernameOrEmail,
        password: this.password,
        rememberMe: this.rememberMe
      });
    }
  }
}

