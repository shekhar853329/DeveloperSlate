import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-github-callback-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[#0b0f17] text-white font-mono text-sm">
      @if (error()) {
        <div class="text-center space-y-4">
          <div class="w-12 h-12 mx-auto rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl">
            ✕
          </div>
          <p class="text-rose-400">{{ error() }}</p>
          <a
            routerLink="/login"
            class="inline-block mt-2 px-4 py-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
          >
            Back to login
          </a>
        </div>
      } @else {
        <div class="text-center space-y-4">
          <div class="w-8 h-8 mx-auto border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-slate-400">Authenticating with GitHub...</p>
        </div>
      }
    </div>
  `
})
export class GithubCallbackPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly error = signal('');

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    const errorParam = this.route.snapshot.queryParamMap.get('error');
    const errorDescription = this.route.snapshot.queryParamMap.get('error_description');

    if (errorParam) {
      // GitHub denied access or user cancelled
      this.error.set(errorDescription ?? 'GitHub authorization was denied.');
      return;
    }

    if (!code) {
      this.error.set('No authorization code received from GitHub.');
      return;
    }

    this.authService.loginWithGithubCode(code).subscribe({
      next: () => this.router.navigate(['/questions']),
      error: (err) => {
        this.error.set(
          typeof err === 'string' ? err : (err?.error?.message ?? 'GitHub login failed. Please try again.')
        );
      }
    });
  }
}
