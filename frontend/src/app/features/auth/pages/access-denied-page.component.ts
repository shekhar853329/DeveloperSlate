import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-access-denied-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-[#0b0f17] text-[#0f172a] dark:text-[#dfe2ee] font-sans antialiased p-6">
      <div class="max-w-md w-full text-center">

        <!-- Icon -->
        <div class="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30">
          <svg class="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <!-- Heading -->
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Access Denied
        </h1>

        <!-- Message -->
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">
          You don't have permission to view
          <span *ngIf="screenKey" class="font-mono text-cyan-500">{{ screenKey }}</span
          ><span *ngIf="!screenKey">this screen</span>.
        </p>
        <p class="text-xs text-slate-400 dark:text-slate-500 mb-8">
          Contact your administrator if you believe this is a mistake.
        </p>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            (click)="goBack()"
            class="px-4 py-2 rounded-md text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Go Back
          </button>
          <a
            routerLink="/questions"
            class="px-4 py-2 rounded-md text-sm font-medium bg-cyan-600 hover:bg-cyan-700 text-white transition-colors">
            Go to Questions
          </a>
        </div>

      </div>
    </div>
  `
})
export class AccessDeniedPageComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected screenKey = this.route.snapshot.queryParamMap.get('screen') ?? '';

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/questions']);
    }
  }
}
