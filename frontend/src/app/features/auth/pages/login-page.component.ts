import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle.component';
import { LoginFormCardComponent } from '../components/login-form.component';
import { QuickDemoLoginComponent } from '../components/quick-demo-login.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent, LoginFormCardComponent, QuickDemoLoginComponent],
  template: `
    <div class="min-h-screen flex flex-col justify-between bg-[#f8fafc] dark:bg-[#0b0f17] text-[#0f172a] dark:text-[#dfe2ee] font-sans antialiased p-4 sm:p-6 lg:p-8">
      
      <!-- Top Navigation & Brand -->
      <div class="max-w-6xl w-full mx-auto flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2.5 group">
          <div class="w-8 h-8 rounded bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-500 font-mono font-bold text-sm group-hover:scale-105 transition-transform">
            &gt;_
          </div>
          <span class="font-bold text-base text-slate-900 dark:text-white tracking-tight font-sans">
            DeveloperSlate
          </span>
          <span class="text-[10px] font-mono px-1.5 py-0.2 rounded border border-cyan-500/30 text-cyan-500 bg-cyan-500/10 hidden sm:inline-block">
            Terminal Gateway
          </span>
        </a>

        <div class="flex items-center gap-3">
          <span class="text-xs font-mono text-slate-400 hidden sm:inline-block">Theme:</span>
          <app-theme-toggle></app-theme-toggle>
        </div>
      </div>

      <!-- Center Auth Module -->
      <div class="max-w-md w-full mx-auto my-8">
        <!-- Card Container -->
        <div class="rounded-lg border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] shadow-xl p-6 sm:p-8 backdrop-blur-sm">
          
          <!-- Terminal Header -->
          <div class="mb-6 text-center">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3 font-mono text-xl">
              &gt;_
            </div>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Developer Authentication Gate
            </h1>
            <p class="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
              Verify cryptographic credentials or connect your GitHub ID.
            </p>
          </div>

          <!-- Form Component -->
          <app-login-form
            #loginForm
            [isLoading]="isLoading"
            [errorMessage]="errorMessage"
            (onSubmit)="handleAuthSubmit($event)"
            (githubAuth)="handleGithubAuth()"
          ></app-login-form>

          <!-- Quick Demo Logins -->
          <app-quick-demo-login
            (onSelect)="loginForm.fillCredentials($event.username, $event.pass)"
          ></app-quick-demo-login>
        </div>

        <!-- Telemetry Security Status -->
        <div class="mt-4 p-3 rounded border border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117] text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span class="flex items-center gap-1.5 text-emerald-500">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>TLS 1.3 / SHA-512 Hash Verified</span>
          </span>
          <span class="text-slate-500">PostgreSQL Identity Store</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="max-w-6xl w-full mx-auto text-center text-xs font-mono text-slate-500 py-2">
        <span>Developer Community Platform • Obsidian Terminal v2.4 • Strict Concurrency Standard</span>
      </div>
    </div>
  `
})
export class LoginPageComponent {
  @ViewChild('loginForm') loginForm?: LoginFormCardComponent;

  private authService = inject(AuthService);
  private router = inject(Router);
  public themeService = inject(ThemeService);

  isLoading = false;
  errorMessage = '';

  handleAuthSubmit(event: any): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (event.isRegister) {
      this.authService.register({
        username: event.username,
        displayName: event.displayName,
        email: event.email,
        password: event.password,
        title: event.title
      }).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/questions']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = typeof err === 'string' ? err : 'Registration failed. Try a different username.';
        }
      });
    } else {
      this.authService.login(event.usernameOrEmail, event.password, event.rememberMe).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/questions']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = typeof err === 'string' ? err : 'Authentication failed. Check your password.';
        }
      });
    }
  }

  handleGithubAuth(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.loginWithGithub('alexchen-dev').subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/questions']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'GitHub authentication failed.';
      }
    });
  }
}

