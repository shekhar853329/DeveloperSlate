import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  private zone = inject(NgZone);
  private toast = inject(ToastService);

  handleError(error: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));

    // Suppress noise that is not actionable for the user
    if (this.isSuppressed(err)) {
      // Still log to console in dev so developers can see it
      if (this.isDevMode()) {
        console.debug('[GlobalErrorHandler] suppressed:', err.message);
      }
      return;
    }

    // Always log to console
    console.error('[GlobalErrorHandler]', err);

    // Show a toast to the user inside the Angular zone so change detection fires
    this.zone.run(() => {
      this.toast.error(this.userMessage(err));
    });
  }

  private isSuppressed(err: Error): boolean {
    const msg = err.message ?? '';
    const name = err.name ?? '';

    return (
      // Angular SSR aborts in-flight renders when the client navigates away — not a real error
      (name === 'AbortError') ||
      // Chunk load failures are handled by the router error handler separately
      msg.includes('Loading chunk') ||
      msg.includes('Failed to fetch dynamically imported module') ||
      // Angular hydration mismatch warnings printed as errors in some versions
      msg.includes('NG0500') ||
      msg.includes('NG0501') ||
      msg.includes('NG0502') ||
      msg.includes('NG0503') ||
      // ExpressionChangedAfterItHasBeenCheckedError — dev-only, not user-facing
      msg.includes('ExpressionChangedAfterItHasBeenChecked')
    );
  }

  private userMessage(err: Error): string {
    const msg = err.message ?? '';

    if (msg.includes('Http failure response')) {
      // HTTP errors are handled by the interceptor — shouldn't reach here, but be safe
      return 'A network error occurred. Please try again.';
    }
    if (msg.includes('Cannot read properties') || msg.includes('is not a function')) {
      return 'An unexpected error occurred. Please refresh the page.';
    }
    // Default
    return 'Something went wrong. Please try again or refresh the page.';
  }

  private isDevMode(): boolean {
    try {
      return typeof ngDevMode !== 'undefined' && !!ngDevMode;
    } catch {
      return false;
    }
  }
}

// Make ngDevMode available without importing the full Angular core internal
declare const ngDevMode: boolean | undefined;
